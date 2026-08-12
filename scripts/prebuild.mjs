// Generates the files that need the filesystem at build time:
//   static/sitemap.xml, static/rss.xml   - adapter-static has no endpoints
//   src/data/image-sizes.json            - intrinsic sizes for markdown images
// Runs before `vite dev` and `vite build`.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { SITE, AUTHOR, SITE_TITLE, SITE_DESCRIPTION } from '../src/lib/site.js';

const NOTES_DIR = 'src/data/notes';
const STATIC_DIR = 'static';
const IMAGES_DIR = 'static/images';

// Pages that exist as routes rather than markdown.
const STATIC_ROUTES = ['/', '/notes/', '/work/', '/notes/archive/', '/notes/taxonomy/'];

const escape = (s) =>
	String(s).replace(
		/[<>&'"]/g,
		(c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[c]};`
	);

function readNotes() {
	return readdirSync(NOTES_DIR)
		.filter((f) => f.endsWith('.md'))
		.map((file) => {
			const raw = readFileSync(join(NOTES_DIR, file), 'utf-8');
			const frontmatter = raw.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? '';
			const field = (name) =>
				frontmatter
					.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'))?.[1]
					.trim()
					.replace(/^['"]|['"]$/g, '') ?? '';
			return {
				slug: file.replace(/\.md$/, ''),
				title: field('title'),
				date: field('date'),
				description: field('description')
			};
		})
		.filter((note) => note.title && note.date)
		.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function sitemap(notes) {
	const entries = [
		...STATIC_ROUTES.map((path) => ({ path, lastmod: notes[0]?.date })),
		...notes.map((n) => ({ path: `/notes/${n.slug}/`, lastmod: n.date }))
	];
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		({ path, lastmod }) =>
			`\t<url>\n\t\t<loc>${SITE}${path}</loc>${lastmod ? `\n\t\t<lastmod>${lastmod}</lastmod>` : ''}\n\t</url>`
	)
	.join('\n')}
</urlset>
`;
}

function rss(notes) {
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
	<channel>
		<title>${escape(SITE_TITLE)}</title>
		<link>${SITE}/</link>
		<description>${escape(SITE_DESCRIPTION)}</description>
		<language>en</language>
		<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${notes
	.map(
		(n) => `\t\t<item>
			<title>${escape(n.title)}</title>
			<link>${SITE}/notes/${n.slug}/</link>
			<guid isPermaLink="true">${SITE}/notes/${n.slug}/</guid>
			<pubDate>${new Date(n.date).toUTCString()}</pubDate>
			<dc:creator>${escape(AUTHOR)}</dc:creator>${n.description ? `\n\t\t\t<description>${escape(n.description)}</description>` : ''}
		</item>`
	)
	.join('\n')}
	</channel>
</rss>
`;
}

// Intrinsic size straight from the file header. Only PNG and JPEG are used in
// the notes; anything else is skipped and simply gets no width/height.
function imageSize(buf) {
	if (buf.readUInt32BE(0) === 0x89504e47) {
		return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
	}
	if (buf.readUInt16BE(0) === 0xffd8) {
		let i = 2;
		while (i < buf.length - 9) {
			if (buf[i] !== 0xff) return null;
			const marker = buf[i + 1];
			// SOF0-SOF15 carry the dimensions; C4/C8/CC are other segment types.
			if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
				return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
			}
			i += 2 + buf.readUInt16BE(i + 2);
		}
	}
	return null;
}

function walkImages(dir, out = {}) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) {
			walkImages(path, out);
			continue;
		}
		if (!/\.(png|jpe?g)$/i.test(entry)) continue;
		const size = imageSize(readFileSync(path));
		// Key by the URL the markdown uses, i.e. the path below static/.
		if (size) out['/' + relative(STATIC_DIR, path).split(sep).join('/')] = size;
	}
	return out;
}

const notes = readNotes();
writeFileSync(join(STATIC_DIR, 'sitemap.xml'), sitemap(notes));
writeFileSync(join(STATIC_DIR, 'rss.xml'), rss(notes));

const sizes = walkImages(IMAGES_DIR);
writeFileSync('src/data/image-sizes.json', JSON.stringify(sizes, null, '\t') + '\n');

console.log(
	`prebuild: ${notes.length} notes in sitemap/rss, ${Object.keys(sizes).length} image sizes`
);

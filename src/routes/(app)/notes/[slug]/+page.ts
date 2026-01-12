import { error } from '@sveltejs/kit';
import type { PageLoad, EntryGenerator } from './$types';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
// @ts-ignore
import rehypeFigure from '@microflash/rehype-figure';
import rehypeStringify from 'rehype-stringify';

export const prerender = true;

// Function to parse frontmatter from markdown
function parseFrontmatter(content: string) {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		return { metadata: {}, content };
	}

	const frontmatterText = match[1];
	const metadata: Record<string, any> = {};

	// Simple YAML parsing for our use case
	frontmatterText.split('\n').forEach((line) => {
		const colonIndex = line.indexOf(':');
		if (colonIndex === -1) return;

		const key = line.slice(0, colonIndex).trim();
		const value = line.slice(colonIndex + 1).trim();

		// Remove quotes if present
		const unquotedValue = value.replace(/^['"]|['"]$/g, '');

		// Parse arrays (tags)
		if (unquotedValue.startsWith('[') && unquotedValue.endsWith(']')) {
			metadata[key] = unquotedValue
				.slice(1, -1)
				.split(',')
				.map((item) => item.trim().replace(/^['"]|['"]$/g, ''));
		} else {
			metadata[key] = unquotedValue;
		}
	});

	const markdownContent = content.slice(match[0].length);
	return { metadata, content: markdownContent };
}

export const entries: EntryGenerator = () => {
	const posts = import.meta.glob('../../../../posts/*.md', { query: '?raw', import: 'default' });

	return Object.keys(posts).map((path) => {
		const slug = path.split('/').pop()?.replace('.md', '') || '';
		return { slug };
	});
};

export const load: PageLoad = async ({ params }) => {
	try {
		// Import the markdown file as raw text
		const postModule = await import(`../../../../posts/${params.slug}.md?raw`);
		const rawContent = postModule.default;

		// Parse frontmatter and content
		const { metadata, content } = parseFrontmatter(rawContent);

		// Convert markdown to HTML using unified with remark and rehype plugins
		const processor = unified()
			.use(remarkParse)
			.use(remarkMath)
			.use(remarkGfm)
			.use(remarkRehype)
			.use(rehypeKatex)
			.use(rehypeSlug)
			.use(rehypeFigure)
			.use(rehypeStringify);

		const htmlContent = String(await processor.process(content));

		return {
			content: htmlContent,
			metadata
		};
	} catch (e) {
		throw error(404, `Could not find blog post: ${params.slug}`);
	}
};

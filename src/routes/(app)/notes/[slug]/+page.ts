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
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { parseFrontmatter } from '$lib/notes';
import imageSizes from '$data/image-sizes.json';

// Markdown images carry no dimensions, so the browser reflows once each one
// loads. Stamp the intrinsic size from the build-time manifest and defer
// everything below the first image, which may be the LCP element.
function rehypeImageAttrs() {
	const sizes: Record<string, { width: number; height: number }> = imageSizes;

	return (tree: any) => {
		let seen = 0;
		const visit = (node: any) => {
			if (node.tagName === 'img') {
				const size = sizes[node.properties?.src];
				if (size) {
					node.properties.width = size.width;
					node.properties.height = size.height;
				}
				if (seen++ > 0) {
					node.properties.loading = 'lazy';
					node.properties.decoding = 'async';
				}
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}

export const prerender = true;

export const entries: EntryGenerator = () => {
	const posts = import.meta.glob('$data/notes/*.md', {
		query: '?raw',
		import: 'default'
	});

	return Object.keys(posts).map((path) => {
		const slug = path.split('/').pop()?.replace('.md', '') || '';
		return { slug };
	});
};

export const load: PageLoad = async ({ params }) => {
	try {
		// Import the markdown file as raw text
		const postModule = await import(`$data/notes/${params.slug}.md?raw`);
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
			.use(rehypeImageAttrs)
			.use(rehypeHighlight)
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

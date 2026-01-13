import type { PageLoad } from './$types';

export const prerender = true;

// Type for blog post metadata
interface BlogPostMetadata {
	title: string;
	date: string;
	readTime?: string;
	description?: string;
	tags?: string[];
}

// Type for blog post with slug
interface BlogPost extends BlogPostMetadata {
	slug: string;
}

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

export const load: PageLoad = async () => {
	const posts = import.meta.glob('$data/notes/*.md', {
		query: '?raw',
		import: 'default'
	});

	const blogPosts: BlogPost[] = await Promise.all(
		Object.entries(posts).map(async ([path, resolver]) => {
			const content = (await resolver()) as string;
			const { metadata } = parseFrontmatter(content);
			const slug = path.split('/').pop()?.replace('.md', '') || '';

			return {
				slug,
				...metadata
			} as BlogPost;
		})
	);

	// Sort by date, newest first
	blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return {
		posts: blogPosts
	};
};

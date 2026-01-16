import type { PageLoad } from './$types';
import { loadBlogPosts, type BlogPost } from '$lib/notes';

export const prerender = true;

export const load: PageLoad = async () => {
	const blogPosts = await loadBlogPosts();

	// Group posts by tags
	const postsByTag = blogPosts.reduce(
		(acc, post) => {
			const tags = post.tags || [];
			tags.forEach((tag) => {
				if (!acc[tag]) acc[tag] = [];
				acc[tag].push(post);
			});
			return acc;
		},
		{} as Record<string, BlogPost[]>
	);

	const tags = Object.keys(postsByTag).sort((a, b) => a.localeCompare(b));

	return {
		postsByTag,
		tags
	};
};

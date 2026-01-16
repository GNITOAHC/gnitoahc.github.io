import type { PageLoad } from './$types';
import { loadBlogPosts, type BlogPost } from '$lib/notes';

export const prerender = true;

export const load: PageLoad = async () => {
	const blogPosts = await loadBlogPosts();

	// Group posts by year
	const postsByYear = blogPosts.reduce(
		(acc, post) => {
			const year = new Date(post.date).getFullYear();
			if (!acc[year]) acc[year] = [];
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, BlogPost[]>
	);

	const years = Object.keys(postsByYear)
		.map(Number)
		.sort((a, b) => b - a);

	return {
		postsByYear,
		years
	};
};

import type { PageLoad } from './$types';
import { loadBlogPosts } from '$lib/notes';

export const prerender = true;

export const load: PageLoad = async () => {
	const blogPosts = await loadBlogPosts();

	return {
		posts: blogPosts.slice(0, 50)
	};
};

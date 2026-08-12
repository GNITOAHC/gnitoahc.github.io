<script lang="ts">
	import type { PageData } from './$types';
	import { PinIcon } from '@lucide/svelte';
	import Seo from '$lib/components/seo.svelte';

	let { data }: { data: PageData } = $props();

	// Separate pinned posts from regular posts
	const pinnedPosts = $derived(data.posts.filter((post) => post.pin));
	const regularPosts = $derived(data.posts.filter((post) => !post.pin));

	// Group regular posts by year
	const postsByYear = $derived(
		regularPosts.reduce(
			(acc, post) => {
				const year = new Date(post.date).getFullYear();
				if (!acc[year]) acc[year] = [];
				acc[year].push(post);
				return acc;
			},
			{} as Record<number, typeof data.posts>
		)
	);

	const years = $derived(Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a)));
</script>

<Seo
	title="Notes - Chao-Ting Chen"
	description="Notes and write-ups on software engineering: Linux and systems internals, C/C++, Go, networking, containers, and machine learning."
/>

<div class="px-6 py-16">
	<div class="mb-12 flex items-baseline justify-between">
		<h1 class="font-serif text-2xl">Writing</h1>
		<div class="flex gap-4">
			<a href="/notes/taxonomy/" class="text-sm text-muted-foreground hover:text-primary">Taxonomy</a
			>
			<a href="/notes/archive/" class="text-sm text-muted-foreground hover:text-primary">Archive</a>
		</div>
	</div>

	{#if pinnedPosts.length > 0}
		<div class="mb-8">
			<h2 class="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
				<PinIcon class="h-3.5 w-3.5" />
				Pinned
			</h2>
			<div class="space-y-4">
				{#each pinnedPosts as post}
					<a href="/notes/{post.slug}/" class="group block">
						<div class="flex items-baseline gap-2">
							<span class="font-serif group-hover:text-primary">{post.title}</span>
							<span class="text-muted-foreground">·</span>
							<span class="text-sm text-muted-foreground">{post.type}</span>
							<span class="flex-1"></span>
							<time class="shrink-0 text-sm text-muted-foreground">
								{new Date(post.date).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric'
								})}
							</time>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	{#each years as year}
		<div class="mb-8">
			<h2 class="mb-4 text-sm text-muted-foreground">{year}</h2>
			<div class="space-y-4">
				{#each postsByYear[Number(year)] as post}
					<a href="/notes/{post.slug}/" class="group block">
						<div class="flex items-baseline gap-2">
							<span class="font-serif group-hover:text-primary">{post.title}</span>
							<span class="text-muted-foreground">·</span>
							<span class="text-sm text-muted-foreground">{post.type}</span>
							<span class="flex-1"></span>
							<time class="shrink-0 text-sm text-muted-foreground">
								{new Date(post.date).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric'
								})}
							</time>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/each}

	{#if data.posts.length === 0}
		<p class="text-muted-foreground">No posts yet.</p>
	{/if}

	{#if data.posts.length > 0}
		<div class="mt-8 text-center">
			<a href="/notes/archive/" class="text-sm text-muted-foreground hover:text-primary">
				View all posts in archive
			</a>
		</div>
	{/if}
</div>

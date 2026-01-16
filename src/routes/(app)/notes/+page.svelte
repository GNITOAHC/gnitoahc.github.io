<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Group posts by year
	const postsByYear = $derived(
		data.posts.reduce(
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

<div class="px-6 py-16">
	<h1 class="mb-12 font-serif text-2xl">Writing</h1>

	{#each years as year}
		<div class="mb-8">
			<h2 class="mb-4 text-sm text-muted-foreground">{year}</h2>
			<div class="space-y-4">
				{#each postsByYear[Number(year)] as post}
					<a href="/notes/{post.slug}" class="group block">
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
</div>

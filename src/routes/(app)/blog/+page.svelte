<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="px-6 py-16">
	<div class="mb-16">
		<h1 class="mb-3 font-serif text-3xl font-medium">Writing</h1>
		<p class="text-muted-foreground">Thoughts on software development and technology</p>
	</div>

	<div class="space-y-12">
		{#each data.posts as post}
			<article class="group">
				<a href="/blog/{post.slug}" class="block">
					<div class="mb-2 flex items-baseline gap-3">
						<time class="text-sm text-muted-foreground">
							{new Date(post.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'short',
								day: 'numeric'
							})}
						</time>
						{#if post.readTime}
							<span class="text-sm text-muted-foreground">·</span>
							<span class="text-sm text-muted-foreground">{post.readTime}</span>
						{/if}
					</div>
					<h2
						class="mb-2 font-serif text-xl font-medium transition-colors group-hover:text-primary"
					>
						{post.title}
					</h2>
					{#if post.description}
						<p class="mb-3 leading-relaxed text-muted-foreground">
							{post.description}
						</p>
					{/if}
					{#if post.tags && post.tags.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each post.tags as tag}
								<span
									class="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
								>
									{tag}
								</span>
							{/each}
						</div>
					{/if}
				</a>
			</article>
		{/each}
	</div>

	{#if data.posts.length === 0}
		<div class="py-12">
			<p class="text-muted-foreground">No posts yet.</p>
		</div>
	{/if}
</div>

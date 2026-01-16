<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let openTags = $state<Record<string, boolean>>({});

	function toggleTag(tag: string) {
		openTags[tag] = !openTags[tag];
	}
</script>

<div class="px-6 py-16">
	<div class="mb-12 flex items-baseline justify-between">
		<h1 class="font-serif text-2xl">Taxonomy</h1>
		<a href="/notes" class="text-sm text-muted-foreground hover:text-primary">Back</a>
	</div>

	<div class="space-y-4">
		{#each data.tags as tag}
			<div>
				<button onclick={() => toggleTag(tag)} class="flex w-full items-center gap-2 text-left">
					<span
						class="text-sm text-muted-foreground transition-transform"
						class:rotate-90={openTags[tag]}
					>
						&#9654;
					</span>
					<span class="font-serif">{tag}</span>
					<span class="text-sm text-muted-foreground">({data.postsByTag[tag].length})</span>
				</button>

				{#if openTags[tag]}
					<div class="mt-3 ml-5 space-y-3">
						{#each data.postsByTag[tag] as post}
							<a href="/notes/{post.slug}" class="group block">
								<div class="flex items-baseline gap-2">
									<span class="group-hover:text-primary">{post.title}</span>
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
				{/if}
			</div>
		{/each}
	</div>

	{#if data.tags.length === 0}
		<p class="text-muted-foreground">No tags yet.</p>
	{/if}
</div>

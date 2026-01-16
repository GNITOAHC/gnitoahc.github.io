<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let openYears = $state<Record<number, boolean>>({});

	function toggleYear(year: number) {
		openYears[year] = !openYears[year];
	}
</script>

<div class="px-6 py-16">
	<div class="mb-12 flex items-baseline justify-between">
		<h1 class="font-serif text-2xl">Archive</h1>
		<a href="/notes" class="text-sm text-muted-foreground hover:text-primary">Back</a>
	</div>

	<div class="space-y-4">
		{#each data.years as year}
			<div>
				<button onclick={() => toggleYear(year)} class="flex w-full items-center gap-2 text-left">
					<span
						class="text-sm text-muted-foreground transition-transform"
						class:rotate-90={openYears[year]}
					>
						&#9654;
					</span>
					<span class="font-serif">{year}</span>
					<span class="text-sm text-muted-foreground">({data.postsByYear[year].length})</span>
				</button>

				{#if openYears[year]}
					<div class="mt-3 ml-5 space-y-3">
						{#each data.postsByYear[year] as post}
							<a href="/notes/{post.slug}" class="group block">
								<div class="flex items-baseline gap-2">
									<span class="group-hover:text-primary">{post.title}</span>
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
				{/if}
			</div>
		{/each}
	</div>
</div>

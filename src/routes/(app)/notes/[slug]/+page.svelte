<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { CalendarIcon, ClockIcon, ArrowLeftIcon, ListIcon } from '@lucide/svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { mode } from 'mode-watcher';

	let { data }: { data: PageData } = $props();

	interface TocItem {
		id: string;
		text: string;
		level: number;
	}

	let tocItems = $state<TocItem[]>([]);
	let showToc = $state(false);
	let isMobile = $state(false);
	let tocContainer = $state<HTMLDivElement | undefined>(undefined);
	let hideTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		// Check if mobile
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);

		// Extract headings from the content
		const content = document.querySelector('.markdown-content');
		if (content) {
			const headings = content.querySelectorAll('h1, h2, h3, h4');
			tocItems = Array.from(headings).map((heading) => ({
				id: heading.id,
				text: heading.textContent || '',
				level: parseInt(heading.tagName[1])
			}));
		}

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	function scrollToHeading(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			if (isMobile) {
				showToc = false;
			}
		}
	}

	function handleTocToggle() {
		if (isMobile) {
			showToc = !showToc;
		}
	}

	function handleMouseEnter(e: PointerEvent) {
		// Only handle mouse events on desktop (not touch events)
		if (!isMobile && e.pointerType !== 'touch') {
			// Clear any pending hide timeout
			if (hideTimeout) {
				clearTimeout(hideTimeout);
				hideTimeout = null;
			}
			showToc = true;
		}
	}

	function handleMouseLeave(e: PointerEvent) {
		// Only handle mouse events on desktop (not touch events)
		if (!isMobile && e.pointerType !== 'touch') {
			// Add a small delay before hiding to allow moving to the panel
			hideTimeout = setTimeout(() => {
				showToc = false;
			}, 150);
		}
	}
</script>

<svelte:head>
	<title>{data.metadata.title} - Chao-Ting Chen</title>
	{#if data.metadata.description}
		<meta name="description" content={data.metadata.description} />
	{/if}
	<!-- rehype-katex -->
	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
		integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
		crossorigin="anonymous"
	/>
	<!-- highlight.js syntax highlighting -->
	{#if mode.current === 'dark'}
		<link
			rel="stylesheet"
			href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css"
		/>
	{:else}
		<link
			rel="stylesheet"
			href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css"
		/>
	{/if}
</svelte:head>

<div class="px-6 py-12">
	<article class="relative">
		<header class="mb-8">
			<h1 class="mb-4 font-serif text-4xl font-bold md:text-5xl">{data.metadata.title}</h1>

			<div class="mb-6 flex flex-wrap items-center gap-4 text-muted-foreground">
				<span class="flex items-center gap-1">
					<CalendarIcon class="h-4 w-4" />
					{new Date(data.metadata.date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</span>
				<!-- {#if data.metadata.readTime} -->
				<!-- 	<span class="flex items-center gap-1"> -->
				<!-- 		<ClockIcon class="h-4 w-4" /> -->
				<!-- 		{data.metadata.readTime} -->
				<!-- 	</span> -->
				<!-- {/if} -->
			</div>

			{#if data.metadata.tags && data.metadata.tags.length > 0}
				<div class="mb-8 flex flex-wrap gap-2">
					{#each data.metadata.tags as tag}
						<span class="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
							{tag}
						</span>
					{/each}
				</div>
			{/if}
		</header>

		<div class="markdown-content">
			{@html data.content}
		</div>

		{@render toc()}

		<footer class="mt-12 border-t border-border pt-8">
			<Button href="/notes" variant="ghost">
				<ArrowLeftIcon class="mr-2 h-4 w-4" />
				Back to all notes
			</Button>
		</footer>
	</article>
</div>

<!-- Table of Contents -->
{#snippet toc()}
	{#if tocItems.length > 0}
		<div
			role="complementary"
			aria-label="Table of Contents"
			class="sticky bottom-8 z-50 ml-auto w-fit"
			bind:this={tocContainer}
			onpointerenter={handleMouseEnter}
			onpointerleave={handleMouseLeave}
		>
			<!-- TOC Panel -->
			{#if showToc}
				<div
					class="absolute right-0 bottom-14 max-h-[70vh] w-64 overflow-y-auto rounded-xl border border-border/50 bg-background/95 p-4 shadow-xl backdrop-blur-md"
				>
					<h3 class="mb-3 text-sm font-semibold text-primary">Table of Contents</h3>
					<nav>
						<ul class="space-y-2">
							{#each tocItems as item}
								<li style="padding-left: {(item.level - 1) * 0.75}rem">
									<button
										onclick={() => scrollToHeading(item.id)}
										class="w-full text-left text-sm text-muted-foreground transition-colors hover:text-primary"
									>
										{item.text}
									</button>
								</li>
							{/each}
						</ul>
					</nav>
				</div>
			{/if}

			<!-- TOC Button -->
			<button
				onclick={handleTocToggle}
				class="group relative flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50 backdrop-blur-sm transition-all duration-300 active:scale-95 md:hover:scale-110 md:hover:bg-secondary md:hover:shadow-lg"
				aria-label="Table of Contents"
			>
				<div
					class="absolute inset-0 rounded-full bg-linear-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				></div>
				<ListIcon class="relative h-5 w-5 transition-colors group-hover:text-primary" />
			</button>
		</div>
	{/if}
{/snippet}

<style>
	:global(.markdown-content) {
		color: var(--color-foreground);
		line-height: 1.8;
		font-size: 1.0625rem;
		max-width: none;
	}

	/* Headings */
	:global(.markdown-content h1) {
		margin-bottom: 1.5rem;
		margin-top: 3rem;
		font-family: var(--font-serif);
		font-size: 2.25rem;
		font-weight: 700;
		color: var(--color-foreground);
		line-height: 1.2;
	}

	:global(.markdown-content h2) {
		margin-bottom: 1rem;
		margin-top: 2.5rem;
		font-family: var(--font-serif);
		font-size: 1.875rem;
		font-weight: 700;
		color: var(--color-foreground);
		line-height: 1.3;
	}

	:global(.markdown-content h3) {
		margin-bottom: 0.75rem;
		margin-top: 2rem;
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-foreground);
		line-height: 1.4;
	}

	:global(.markdown-content h4) {
		margin-bottom: 0.75rem;
		margin-top: 1.5rem;
		font-family: var(--font-serif);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-foreground);
	}

	:global(.markdown-content h5) {
		margin-bottom: 0.5rem;
		margin-top: 1rem;
		font-family: var(--font-serif);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-foreground);
	}

	:global(.markdown-content h6) {
		margin-bottom: 0.5rem;
		margin-top: 1rem;
		font-family: var(--font-serif);
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-foreground);
	}

	/* First heading should not have top margin */
	:global(.markdown-content > h1:first-child),
	:global(.markdown-content > h2:first-child),
	:global(.markdown-content > h3:first-child) {
		margin-top: 0;
	}

	/* Paragraphs */
	:global(.markdown-content p) {
		margin-bottom: 1.5rem;
		color: color-mix(in oklch, var(--color-foreground) 90%, transparent);
	}

	/* Links */
	:global(.markdown-content a) {
		color: var(--color-primary);
		text-decoration: underline;
		text-decoration-color: color-mix(in oklch, var(--color-primary) 30%, transparent);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.2s;
	}

	:global(.markdown-content a:hover) {
		text-decoration-color: var(--color-primary);
	}

	/* Lists */
	:global(.markdown-content ul),
	:global(.markdown-content ol) {
		margin-bottom: 1.5rem;
		margin-left: 1.5rem;
	}

	:global(.markdown-content ul) {
		list-style-type: disc;
	}

	:global(.markdown-content ol) {
		list-style-type: decimal;
	}

	:global(.markdown-content li) {
		color: color-mix(in oklch, var(--color-foreground) 90%, transparent);
		padding-left: 0.5rem;
		margin-bottom: 0.5rem;
	}

	:global(.markdown-content li > p) {
		margin-bottom: 0.5rem;
	}

	:global(.markdown-content ul ul),
	:global(.markdown-content ol ul),
	:global(.markdown-content ul ol),
	:global(.markdown-content ol ol) {
		margin-bottom: 0.5rem;
		margin-top: 0.5rem;
	}

	/* Blockquotes */
	:global(.markdown-content blockquote) {
		margin: 1.5rem 0;
		border-left: 4px solid var(--color-primary);
		background-color: var(--color-muted);
		padding: 1rem 1rem 1rem 1.5rem;
		font-style: italic;
		color: color-mix(in oklch, var(--color-foreground) 80%, transparent);
	}

	:global(.markdown-content blockquote p:last-child) {
		margin-bottom: 0;
	}

	/* Code blocks */
	:global(.markdown-content pre) {
		margin: 1.5rem 0;
		overflow-x: auto;
		border-radius: 0.5rem;
		border: 1px solid var(--color-border);
		background-color: var(--color-muted);
		padding: 1rem;
	}

	:global(.markdown-content pre code) {
		background-color: transparent;
		padding: 0;
		font-size: 0.875rem;
		font-family: var(--font-mono);
		color: var(--color-foreground);
		border-radius: 0;
	}

	/* Inline code */
	:global(.markdown-content code) {
		border-radius: 0.25rem;
		background-color: var(--color-muted);
		padding: 0.125rem 0.375rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--color-foreground);
	}

	:global(.markdown-content :not(pre) > code) {
		background-color: var(--color-muted);
		padding: 0.125rem 0.375rem;
	}

	/* Horizontal rule */
	:global(.markdown-content hr) {
		margin: 3rem 0;
		border-color: var(--color-border);
	}

	/* Tables */
	:global(.markdown-content table) {
		margin: 1.5rem 0;
		width: 100%;
		border-collapse: collapse;
		display: block;
		overflow-x: auto;
	}

	:global(.markdown-content tbody),
	:global(.markdown-content thead) {
		display: table;
		width: 100%;
	}

	:global(.markdown-content thead) {
		border-bottom: 2px solid var(--color-border);
	}

	:global(.markdown-content th) {
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
		color: var(--color-foreground);
	}

	:global(.markdown-content td) {
		border-bottom: 1px solid var(--color-border);
		padding: 0.75rem;
		color: color-mix(in oklch, var(--color-foreground) 90%, transparent);
	}

	:global(.markdown-content tbody tr:last-child td) {
		border-bottom: 0;
	}

	:global(.markdown-content tbody tr:hover) {
		background-color: color-mix(in oklch, var(--color-muted) 50%, transparent);
	}

	/* Figures (images with captions) */
	:global(.markdown-content figure) {
		margin: 2.5rem auto;
		max-width: 100%;
	}

	/* Images */
	:global(.markdown-content img) {
		display: block;
		margin: 0 auto;
		border-radius: 0.75rem;
		border: 1px solid var(--color-border);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		max-width: 100%;
		height: auto;
		transition: all 0.3s ease;
	}

	:global(.markdown-content img:hover) {
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		transform: translateY(-2px);
	}

	/* Standalone images (not in figure) */
	:global(.markdown-content p img:only-child) {
		margin: 2.5rem auto;
	}

	/* Images inside paragraphs */
	:global(.markdown-content p img) {
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}

	/* Figure captions */
	:global(.markdown-content figcaption) {
		margin-top: 0.75rem;
		text-align: center;
		font-size: 0.875rem;
		font-style: italic;
		color: var(--color-muted-foreground);
		line-height: 1.5;
	}

	/* Support for image alignment via markdown (if using title attribute) */
	:global(.markdown-content figure[title*='left']),
	:global(.markdown-content img[title*='left']) {
		margin-left: 0;
		margin-right: auto;
	}

	:global(.markdown-content figure[title*='right']),
	:global(.markdown-content img[title*='right']) {
		margin-left: auto;
		margin-right: 0;
	}

	:global(.markdown-content figure[title*='center']),
	:global(.markdown-content img[title*='center']) {
		margin-left: auto;
		margin-right: auto;
	}

	/* Strong and emphasis */
	:global(.markdown-content strong) {
		font-weight: 700;
		color: var(--color-foreground);
	}

	:global(.markdown-content em) {
		font-style: italic;
	}

	/* Task lists */
	:global(.markdown-content input[type='checkbox']) {
		margin-right: 0.5rem;
	}

	/* KaTeX adjustments */
	:global(.markdown-content .katex) {
		font-size: 1em;
		overflow-x: scroll;
		overflow-y: visible;
	}
</style>

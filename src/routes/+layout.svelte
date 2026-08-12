<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="alternate" type="application/rss+xml" title="Chao-Ting Chen" href="/rss.xml" />
</svelte:head>

<ModeWatcher />

<div class="mx-auto min-h-screen max-w-4xl bg-background text-foreground">
	{@render children()}
</div>

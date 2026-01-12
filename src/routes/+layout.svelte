<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { ModeWatcher } from 'mode-watcher';
	import Header from './header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Chao-Ting Chen</title>
</svelte:head>

<ModeWatcher />

<div class="mx-auto min-h-screen max-w-4xl bg-background text-foreground">
	<Header />
	{@render children()}
</div>

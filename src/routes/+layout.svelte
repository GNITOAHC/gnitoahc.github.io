<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();

	const title = 'Chao-Ting Chen - Software Engineer & Developer';
	const description =
		"Welcome to my personal website. I'm passionate about building elegant solutions to complex problems. Explore my thoughts on software development, projects, and more.";
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Chao-Ting Chen</title>

	<!-- Primary Meta Tags -->
	<meta name="title" content={title} />
	<meta name="description" content={description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://gnitoahc.github.io/" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://gnitoahc.github.io/me.jpg" />
	<meta property="og:site_name" content="Chao-Ting Chen" />
</svelte:head>

<ModeWatcher />

<div class="mx-auto min-h-screen max-w-4xl bg-background text-foreground">
	{@render children()}
</div>

<script lang="ts">
	import { page } from '$app/state';
	import { SITE, AUTHOR } from '$lib/site.js';

	let {
		title,
		description,
		type = 'website',
		image = `${SITE}/me.jpg`,
		jsonld = undefined
	}: {
		title: string;
		description: string;
		type?: 'website' | 'article';
		image?: string;
		jsonld?: Record<string, unknown>;
	} = $props();

	const canonical = $derived(SITE + page.url.pathname);
</script>

<svelte:head>
	<title>{title}</title>
	<link rel="canonical" href={canonical} />
	<meta name="description" content={description} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:site_name" content={AUTHOR} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />

	{#if jsonld}
		<!-- `<` is escaped so a `</script>` inside the data cannot close the tag early. -->
		{@html `<script type="application/ld+json">${JSON.stringify(jsonld).replaceAll('<', '\\u003c')}</` +
			`script>`}
	{/if}
</svelte:head>

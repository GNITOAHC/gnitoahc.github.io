<script lang="ts">
	import Header from './header.svelte';

	let { children } = $props();
</script>

<div class="mx-auto min-h-screen max-w-4xl bg-background text-foreground">
	<Header />
	{@render children()}
</div>

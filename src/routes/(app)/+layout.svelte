<script lang="ts">
	import Header from './header.svelte';

	let { children } = $props();
</script>

<div class="w-full">
	<Header />
	{@render children()}
</div>

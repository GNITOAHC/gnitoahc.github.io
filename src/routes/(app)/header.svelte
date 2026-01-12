<script lang="ts">
	import { SunIcon, MoonIcon } from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<nav class="flex items-center justify-between py-4">
	<a href="/">
		<h1 class="font-serif text-2xl font-bold">Chao-Ting Chen</h1>
	</a>
	<div class="flex items-center gap-4">
		<a class="font-serif" href="/blog">Blog</a>
		<a class="font-serif" href="/projects">Projects</a>
		{@render modeToggler()}
	</div>
</nav>

{#snippet modeToggler()}
	<Button onclick={toggleMode} variant="ghost" size="icon">
		<SunIcon
			class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
		/>
		<MoonIcon
			class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
{/snippet}

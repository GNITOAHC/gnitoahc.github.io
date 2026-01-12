<script lang="ts">
	import '../../layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import { SunIcon, MoonIcon, House } from '@lucide/svelte';
	import { toggleMode } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />

<div class="mx-auto min-h-screen max-w-4xl bg-background text-foreground">
	<!-- Simple Blog Header -->
	<header class="border-b border-border">
		<nav class="flex items-center justify-between px-6 py-4">
			<div class="flex items-center gap-6">
				<a href="/" class="flex items-center gap-2 text-muted-foreground hover:text-foreground">
					<House class="h-4 w-4" />
					<span class="text-sm">Home</span>
				</a>
				<a href="/blog" class="font-serif text-xl font-bold">Blog</a>
			</div>
			<Button onclick={toggleMode} variant="ghost" size="icon">
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</nav>
	</header>

	<!-- Content Area -->
	<main>
		{@render children()}
	</main>

	<!-- Simple Footer -->
	<footer class="mt-16 border-t border-border px-6 py-8">
		<div class="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
			<p>&copy; {new Date().getFullYear()} Chao-Ting Chen. All rights reserved.</p>
			<div class="flex items-center gap-4">
				<a href="/" class="hover:text-foreground">Home</a>
				<span>•</span>
				<a href="/blog" class="hover:text-foreground">Blog</a>
				<span>•</span>
				<a href="/projects" class="hover:text-foreground">Projects</a>
			</div>
		</div>
	</footer>
</div>

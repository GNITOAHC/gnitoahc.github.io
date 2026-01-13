<script lang="ts">
	import { GithubIcon } from '@lucide/svelte';
	import { projects } from '$data/work/work.js';
</script>

<div class="px-6 py-16">
	<div class="mb-16">
		<h1 class="mb-3 font-serif text-3xl font-medium">Work</h1>
		<p class="text-muted-foreground">Selected projects and experiments</p>
	</div>

	<div class="space-y-16">
		{#each projects as project}
			{@const hasValidLive = project.live !== '#'}
			{@const hasValidGithub = project.github !== '#'}
			{@const isClickable = hasValidLive || hasValidGithub}
			{@const primaryLink = hasValidLive ? project.live : project.github}

			<article class="group relative">
				<!-- Links positioned absolutely -->
				<div
					class="absolute top-0 right-0 z-10 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					{#if hasValidGithub}
						<a
							href={project.github}
							target="_blank"
							rel="noopener noreferrer"
							class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-secondary"
							aria-label="View source code"
						>
							<GithubIcon class="h-4 w-4" />
						</a>
					{/if}
				</div>

				{#if isClickable}
					<a href={primaryLink} class="block space-y-3">
						<!-- Title -->
						<h2
							class="flex items-center gap-2 font-serif text-xl font-medium transition-colors duration-300 group-hover:text-primary"
						>
							{project.title}
							{#if hasValidLive}
								<span
									class="hidden h-1.5 w-1.5 animate-pulse rounded-full bg-primary group-hover:inline-block"
								></span>
							{/if}
						</h2>

						<!-- Description -->
						<p class="leading-relaxed text-muted-foreground">
							{project.description}
						</p>

						<!-- Tags -->
						<div class="flex flex-wrap gap-2 text-sm text-muted-foreground">
							{#each project.tags as tag}
								<span class="transition-colors hover:text-foreground">{tag}</span>
							{/each}
						</div>

						<!-- Animated underline on hover -->
						<div
							class="mt-4 h-px w-0 bg-linear-to-r from-primary/50 to-transparent transition-all duration-500 group-hover:w-full"
						></div>
					</a>
				{:else}
					<div class="space-y-3">
						<!-- Title and links -->
						<div class="flex items-start justify-between gap-4">
							<h2
								class="flex items-center gap-2 font-serif text-xl font-medium transition-colors duration-300 group-hover:text-primary"
							>
								{project.title}
							</h2>

							<!-- Links -->
							<div
								class="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							>
								{#if project.github !== '#'}
									<a
										href={project.github}
										class="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary"
										aria-label="View source code"
									>
										<GithubIcon class="h-4 w-4" />
									</a>
								{/if}
							</div>
						</div>

						<!-- Description -->
						<p class="leading-relaxed text-muted-foreground">
							{project.description}
						</p>

						<!-- Tags -->
						<div class="flex flex-wrap gap-2 text-sm text-muted-foreground">
							{#each project.tags as tag}
								<span class="transition-colors hover:text-foreground">{tag}</span>
							{/each}
						</div>

						<!-- Animated underline on hover -->
						<div
							class="mt-4 h-px w-0 bg-linear-to-r from-primary/50 to-transparent transition-all duration-500 group-hover:w-full"
						></div>
					</div>
				{/if}
			</article>
		{/each}
	</div>

	{#if projects.length === 0}
		<div class="py-12">
			<p class="text-muted-foreground">No projects yet.</p>
		</div>
	{/if}
</div>

<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { GithubIcon, GraduationCapIcon, LinkedinIcon, MailIcon } from '@lucide/svelte';
	import { experiences } from '$data/experience/experience.js';
</script>

<main class="px-6 py-12">
	<section class="mb-16 flex flex-col items-center gap-8 md:flex-row md:items-start">
		<div class="shrink-0">
			<img
				src="/me.jpg"
				alt="Chao-Ting Chen"
				class="h-48 w-48 rounded-full object-cover shadow-lg"
			/>
		</div>
		<div class="flex-1 text-center md:text-left">
			<h1 class="mb-4 font-serif text-4xl font-bold">Hi, I'm Chao-Ting Chen</h1>
			<p class="mb-6 text-xl text-muted-foreground">Software Engineer & Developer</p>
			<p class="mb-6 leading-relaxed text-foreground/90">
				Welcome to my personal website. I'm passionate about building elegant solutions to complex
				problems. Here you'll find my thoughts on software development, projects I've worked on, and
				more.
			</p>
			<div class="flex flex-wrap justify-center gap-3 md:justify-start">
				<Button href="/notes" variant="default">Read notes</Button>
				<Button href="/work" variant="outline">View work</Button>
			</div>
		</div>
	</section>

	<section class="mb-16">
		<h2 class="mb-6 font-serif text-3xl font-bold">About Me</h2>
		<div class="space-y-4 leading-relaxed text-foreground/90">
			<p>
				I’m a 21-year-old computer science student passionate about technology, programming,
				innovation, and AI. I’m based in Taipei, Taiwan, where I’m pursuing my degree and exploring
				the vast world of software development and artificial intelligence.
			</p>
			<p>
				When I'm not coding, you can find me exploring new technologies, contributing to open source
				projects, or sharing my knowledge through blog posts and technical writing.
			</p>
		</div>
	</section>

	<section class="mb-16">
		<h2 class="mb-6 font-serif text-3xl font-bold">Experience</h2>
		<div class="space-y-6">
			{#each experiences as experience}
				<div class="flex gap-4">
					<div class="shrink-0">
						{#if experience.logo}
							<img
								src={experience.logo}
								alt={experience.organization}
								class="h-12 w-12 rounded-xl object-contain"
							/>
						{:else}
							<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
								<span class="text-xs text-muted-foreground">Logo</span>
							</div>
						{/if}
					</div>
					<div class="flex-1">
						<div class="mb-1 flex items-baseline justify-between gap-2">
							<h3 class="font-semibold">{experience.title}</h3>
							<span class="text-sm text-muted-foreground">{experience.period}</span>
						</div>
						<p class="text-sm text-muted-foreground">{experience.organization}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="mb-6 font-serif text-3xl font-bold">Get in Touch</h2>
		<div class="flex flex-wrap gap-3">
			<Button variant="outline" size="default" href="https://github.com/GNITOAHC" target="_blank">
				<GithubIcon class="mr-2 h-4 w-4" />
				GitHub
			</Button>
			<Button
				variant="outline"
				size="default"
				href="https://www.linkedin.com/in/chaoting-chen/"
				target="_blank"
			>
				<LinkedinIcon class="mr-2 h-4 w-4" />
				LinkedIn
			</Button>
			<Button variant="outline" size="default" href="mailto:chaotingchen10@gmail.com">
				<MailIcon class="mr-2 h-4 w-4" />
				Email
			</Button>
			<Button
				variant="outline"
				size="default"
				href="https://scholar.google.com/citations?user=Iwa-1FgAAAAJ"
				target="_blank"
			>
				<GraduationCapIcon class="mr-2 h-4 w-4" />
				Google Scholar
			</Button>
		</div>
	</section>
</main>

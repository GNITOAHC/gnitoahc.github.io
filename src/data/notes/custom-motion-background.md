---
title: Build a Custom Motion Background in NextJs
date: 2023-12-08
description: Build a custom motion background from scratch which run across different routes
readTime: 2 min read
tags: ['Frontend']
type: writing
---

# Introduction

This article demonstates how to create a background animation which run across routes.

# Prerequisite

Base NextJs, CSS and Typescript knowledge.

# Breadkdown

## Step 1: Create a new NextJs project

We're going to use `bun` to create our new project. For more information, check out [bun.sh](https://bun.sh/guides/ecosystem/nextjs).

```shell
bun create next-app # Initialize a NextJs app with create-next-app and choose all the default options.
```

```shell
cd my-app
bun --bun run dev
```

## Step 2: Setup our background component

First, we need to create a background component that wraps all the pages for which we wish to have the motion background.  
Create a components directory and add Motion.tsx under the components folder.

```txt
app/
├── component/
│   └── Motion.tsx
├── layout.tsx
└── page.tsx
```

Then, setup the `Motion.tsx`.

```tsx {9-11}
'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import './motion.css';

export default function Motion({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	React.useEffect(() => {
		const bgCircle = document.getElementById('bgcircle');
	}, [pathname]);

	return (
		<div className="relative h-screen overflow-x-clip overflow-y-hidden font-mono">
			<div
				id="bgcircle"
				style={{
					width: 554.69,
					height: 520.02,
					transform: 'rotate(-13.48deg)',
					transformOrigin: '0 0',
					background:
						'linear-gradient(162deg, #DDFFFF 0%, rgba(84.93, 183.45, 254.79, 0.94) 70%, rgba(34, 56.10, 255, 0.94) 100%)',
					boxShadow: '0px 10px 180px #E1CDFA',
					borderRadius: 9999,
					zIndex: -1
				}}
				className="absolute -top-[5%] -left-[10%] max-w-[100vw]"
			/>

			{children}
		</div>
	);
}
```

`React.useEffect` will be called whenever the dependency i.e. `pathname` is changed.

We setup a background with position `absolute` so that it does not messup the position of other components.  
After setting up the component, we need to update it's position when navigating across the routes.

```diff
 React.useEffect(() => {
   const bgCircle = document.getElementById('bgcircle')
+  if (pathname === '/') {
+    bgCircle.style.top = '-5%'
+    bgCircle.style.left = '-10%'
+  } else if (pathname.startsWith('/blog/')) {
+    bgCircle.style.top = '-150%'
+    bgCircle.style.left = '-150%'
+  }
 }, [pathname])
```

To make the transition smooth, we can customize the `motion.css`.

```css
/* app/components/motion.css */
div {
	transition: all 0.5s ease-in-out;
}
```

## Step 3: Wrap the app inside the Motion component

After setting up the component, we need to wrap our entire app inside this background privider.

```diff
// app/layout.tsx
+import Motion from '@/app/components/Motion'

@@ -- @@

 export default function RootLayout({
   children,
 }: {
   children: React.ReactNode
 }) {
   return (
     <html lang="en">
       <body>
-        {children}
+        <Motion>{children}</Motion>
       </body>
     </html>
   )
 }
```

And now, the entire app is wrapped with our Motion component.  
Create `/blog/` routes and observe the change of our new background!!

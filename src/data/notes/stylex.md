---
title: StyleX
date: 2023-12-15
description: New styling system announced by Meta.
readTime: 3 min read
tags: ['Frontend']
type: writing
---

StyleX is a new styling system designed by Meta.  
According to their blog, every major product in Meta including Facebook, WhatsApp, Instagram and Threads, are using it.

# Installation

We will use NextJs to demonstrate the StyleX usage in this blog.  
Let's first create a new next-app and remember to choose `no` if `bun` ask if you prefer to use tailwindcss.

```shell
bun create next-app
✔ What is your project named? … my-app
✔ Would you like to use TypeScript with this project? … No / Yes
✔ Would you like to use ESLint with this project? … No / Yes
✔ Would you like to use `src/` directory with this project? … No / Yes
✔ Would you like to use experimental `app/` directory with this project? … No / Yes
✔ What import alias would you like configured? … @/*
Creating a new Next.js app in /path/to/my-app.
```

To use StyleX in next-app, install StyleX plugins.

```shell
bun add @stylexjs/stylex
bun add --development @stylexjs/babel-plugin @stylexjs/eslint-plugin @stylexjs/nextjs-plugin
bun install
```

# Configuration

Because NextJs use its own [Next.js Compiler](https://nextjs.org/docs/architecture/nextjs-compiler), we need to setup the babel-plugin ourselves.

```javascript
// .babelrc.js
const path = require('path');

module.exports = {
	presets: ['next/babel'],
	plugins: [
		[
			'@stylexjs/babel-plugin',
			{
				dev: process.env.NODE_ENV === 'development',
				runtimeInjection: false,
				genConditionalClasses: true,
				treeshakeCompensation: true,
				unstable_moduleResolution: {
					type: 'commonJS',
					rootDir: path.join(__dirname, '../..')
				}
			}
		]
	]
};
```

By the way, we need to tell Next to use the StyleX plugins.

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {};

const stylexPlugin = require('@stylexjs/nextjs-plugin');

module.exports = stylexPlugin({
	rootDir: __dirname
})(nextConfig);

// module.exports = nextConfig
```

# Modify the Existing Files

## Adding Next ThemeProvider for Dark Mode

```shell
bun install next-themes
```

Under `app/components`, add `ThemeProvider.tsx`.

```TypeScript
'use client'
import React from 'react'
import { ThemeProvider } from 'next-themes'

interface Props {
  children: React.ReactNode
}

const Providers = (props: Props) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      {props.children}
    </ThemeProvider>
  )
}

export default Providers
```

then import it inside `app/layout.tsx`. We'll demo the code in the next section.

## `Layout.tsx`

Due to the compiler StyleX plugin using, we can't use `next/font` anymore. Otherwise, compiler will give us the error.

```shell
 ⨯ ./app/layout.tsx:2:1
Syntax error: "next/font" requires SWC although Babel is being used due to a custom babel config being present.
Read more: https://nextjs.org/docs/messages/babel-font-loader-conflict
```

We need to comment or remove the following line from the initial `layout.tsx`.

```diff
import type { Metadata } from 'next'
-import { Inter } from 'next/font/google'
 import './globals.css'
-
-const inter = Inter({ subsets: ['latin'] })
+import ThemeProvider from './components/ThemeProvider'

 export const metadata: Metadata = {
   title: 'Create Next App',
@@ -15,8 +13,10 @@ export default function RootLayout({
   children: React.ReactNode
 }) {
   return (
-    <html lang="en">
-      <body className={inter.className}>{children}</body>
+    <html lang="en" suppressHydrationWarning>
+      <body>
+        <ThemeProvider>{children}</ThemeProvider>
+      </body>
     </html>
   )
 }
```

# StyleX

Create StyleX component under `app` directory.

```typescript
// app/Stylex.tsx
import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  main: {
    backgroundColor: {
      default: 'var(--color-primary)',
    },
    color: 'white',
  },
  button: {
    color: 'blue',
    textColor: 'white',
  },
})

export default function Stylex() {
  return (
    <main {...stylex.props(styles.main)}>
      <p>main</p>
      <button {...stylex.props(styles.button)}>button</button>
    </main>
  )
}
```

Next, replace `global.css` with minimum config.

```css
.light {
	--color-primary: #f9f9f9;
}

.dark {
	--color-primary: #1a1a1a;
}
```

Last, replace `app/page.tsx` to demonstrate the StyleX usage.

```typescript
'use client'
import React from 'react'
import Stylex from './Stylex'
import { useTheme } from 'next-themes'

export default function Home() {
  const { setTheme } = useTheme()

  return (
    <main>
      <header>
        <button onClick={() => setTheme('light')}>light</button>
        <button onClick={() => setTheme('dark')}>dark</button>
        <button onClick={() => setTheme('system')}>system</button>
      </header>
      <Stylex />
    </main>
  )
}
```

# Outro

StyleX is a CSS-in-JS library that simplifies styling and enables more dynamic and programmatic management.
It offers flexibility and control over styling elements.
However, integrating StyleX in Next.js results in the compiler [disabling SWC](https://nextjs.org/docs/messages/swc-disabled), despite SWC being 17x faster than Babel.
For this reason, I believe I'll continue using Tailwind CSS for the time being.
I hope that these custom Babel transformations can be transferred to SWC's Rust-based transforms in the near future.

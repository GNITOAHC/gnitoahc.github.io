---
title: Setting up Typescript for Express App
date: 2024-02-29
description: A comprehensive guide to integrating typescript into your express.js project
readTime: 2 min read
tags: ['Typescript', 'Backend']
type: writing
---

_ref_:

- [LogRocket: How to set up TypeScript with Node.js and Express](https://blog.logrocket.com/how-to-set-up-node-typescript-express/)
- [Medium: Setting up ExpressJS and TypeScript](https://medium.com/@it.ermias.asmare/setting-up-expressjs-and-typescript-cfbee581c678)

# Introduction

Transitioning from JavaScript to TypeScript in your Express.js application can greatly enhance its maintainability, scalability, and developer experience.
In this guide, we'll walk through the process of setting up TypeScript for your Express app, covering everything from installation to configuration and implementation.

## Prerequisites

Before we dive into setting up TypeScript for your Express app, make sure you have the following prerequisites installed:

- Node.js and npm (Node Package Manager)
- Basic knowledge of Express.js
- Familiarity with TypeScript concepts

# Create a Server with Express

## Initialize a Express App

First, create a new directory and navigate into it.

```bash
mkdir express-typescript
cd express-typescript
```

Next, initialize the Node.js project.

```bash
npm init -y
```

## Install Dependencies and Configure Typescript

Install dependencies.

```bash
npm install express
npm install --save-dev typescript nodemon concurrently @types/node @types/express
```

- express: The Express app.
- typescript: The Typescript compiler.
- nodemon: Utility that automatically restarts the server when changes are detected.
- concurrently: Run multiple commands concurrently.
- @types/node: TypeScript definitions for Node.js.
- @types/express: TypeScript definitions for Express.js.

Create `tsconfig.json`.

```bash
npx tsc --init
```

The default output will look like this.

```
Created a new tsconfig.json with:
                                                                                            TS
  target: es2016
  module: commonjs
  strict: true
  esModuleInterop: true
  skipLibCheck: true
  forceConsistentCasingInFileNames: true


You can learn more at https://aka.ms/tsconfig
```

- target: Specifies the ECMAScript target version.
- module: Facilitates the utilization of a module manager in the compiled JavaScript code, CommonJS is supported and is a standard in Node.js.
- strict: Toggles strict type-checking protocols.
- esModuleInterop: Enables the compilation of ES6 modules to CommonJS modules.
- skipLibCheck: When set to true, bypasses type-checking of default library declaration files.
- forceConsistentCasingInFileNames: When set to true, enforces case-sensitive file naming.

By default, the value of this option is set to the project’s root. Change it to dist, as shown below:

```
{
  "compilerOptions": {
    ...
    "outDir": "./dist"
    ...
  }
}
```

## Create the Express App

Create a simple Express app in Typescript. Create a `src` directory and a file named `index.ts` inside it.

```ts
import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
	res.send('Hello TypeScript with Express!');
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
```

## Update npm Scripts and Start the Program

Open the `package.json` and upgrade `scripts` section to include the following.

```json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "npx tsc",
    "start": "node dist/index.js",
    "dev": "concurrently \"npx tsc --watch\" \"nodemon -q dist/index.js\""
},
```

First build the app and start it, or simply run in dev mode.

```bash
# Build and start
npm run build
npm run dev

# Or, simply run in dev mode
npm run dev
```

# Conclusion

In conclusion, integrating TypeScript into your Express.js application not only enhances its maintainability, scalability, and developer experience but also provides numerous benefits in terms of code quality and error prevention.
By leveraging TypeScript's static typing, you can catch errors at compile-time rather than runtime, leading to more robust and reliable code.
With TypeScript's static typing and Express's powerful features, we can now build robust and maintainable web applications with confidence!!!

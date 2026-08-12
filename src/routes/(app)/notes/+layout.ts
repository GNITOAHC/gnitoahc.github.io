// `+layout@.svelte` resets the layout chain, so this subtree does not inherit
// the page options from `(app)/+layout.ts` and has to repeat them.
export const prerender = true;
export const trailingSlash = 'always';

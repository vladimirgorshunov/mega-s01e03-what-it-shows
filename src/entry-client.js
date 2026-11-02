import { hydrate } from 'svelte';

const pages = import.meta.glob('/src/routes/**/+page.svx', { eager: true });
const target = document.getElementById('app');
const page = pages[target.dataset.source];
if (!page) throw new Error(`No KB page for ${target.dataset.source}`);
hydrate(page.default, { target });

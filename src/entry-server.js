import { render } from 'svelte/server';
import { evidence } from '#lib/kb/evidence';

const pages = import.meta.glob('/src/routes/**/+page.svx', { eager: true });
export { evidence };
export const routes = Object.entries(pages).map(([source, page]) => ({
  source,
  route: source.replace('/src/routes', '').replace('/+page.svx', ''),
  render: () => render(page.default),
}));

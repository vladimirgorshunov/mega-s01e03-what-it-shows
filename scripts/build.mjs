import { build } from 'vite';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

// Only generated output is replaced. Export source and accepted decisions are never rewritten.
await rm('rendered', { recursive: true, force: true });
await mkdir('rendered', { recursive: true });
await build({ build: {
  outDir: 'rendered', emptyOutDir: false, manifest: true,
  rollupOptions: { input: 'src/entry-client.js' },
} });
await build({ build: {
  outDir: '.build/server', emptyOutDir: true, ssr: 'src/entry-server.js',
  rollupOptions: { output: { entryFileNames: 'entry-server.js' } },
} });
const { routes, evidence } = await import(resolve('.build/server/entry-server.js'));
const manifest = JSON.parse(await readFile('rendered/.vite/manifest.json', 'utf8'));
const client = manifest['src/entry-client.js'].file;
const escapeAttribute = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
for (const page of routes) {
  const { head, body } = page.render();
  const directory = `rendered${page.route}`;
  await mkdir(directory, { recursive: true });
  const html = `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body><div id="app" data-source="${escapeAttribute(page.source)}">${body}</div><script type="module" src="/${client}"></script></body></html>\n`;
  await writeFile(`${directory}/index.html`, html);
  console.log(`Rendered ${page.route}`);
}
await writeFile('rendered/evidence.json', JSON.stringify(evidence, null, 2) + '\n');
await writeFile('rendered/index.html', '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/kb/incidents/4471-review/"><title>Support KB review</title></head><body><a href="/kb/incidents/4471-review/">Open the signed support KB review</a></body></html>\n');
console.log(`Published actual Svelte HTML for ${routes.length} KB pages; ${evidence.uniqueReports} unique reports.`);

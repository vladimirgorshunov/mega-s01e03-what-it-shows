# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 evidence review

The original export above is preserved, including its historical incident narrative,
components, and accepted ADR 0001. Its prose is not the new conclusion.

- Signed review: [`src/routes/kb/incidents/4471-review/+page.svx`](src/routes/kb/incidents/4471-review/+page.svx)
- Actual compiled Svelte page: [`rendered/kb/incidents/4471-review/index.html`](rendered/kb/incidents/4471-review/index.html)
- Browser capture: [`rendered/review-desktop.png`](rendered/review-desktop.png)
- Machine-readable, computed assignments: [`rendered/evidence.json`](rendered/evidence.json)
- Issues: [parser](https://github.com/vladimirgorshunov/mega-s01e03-what-it-shows/issues?q=is%3Aissue+parser),
  [booking-v3 hint](https://github.com/vladimirgorshunov/mega-s01e03-what-it-shows/issues?q=is%3Aissue+hint)
- Proposed replacement for subject-only deduplication:
  [`src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx`](src/routes/kb/decisions/0002-dedupe-by-cause/+page.svx)

### Reproduce what the desk sees

Requires Node 22.12+ (Node 26 was used). In this directory:

```sh
npm ci --registry=https://registry.npmjs.org --cache .npm-cache
npm run build
npm run check
npm run preview
```

Open <http://127.0.0.1:4173/kb/incidents/4471-review/>.
The preview binds only to localhost. Stop it with Ctrl-C.
GitHub's file view shows HTML source; use the preview for the actual styled page
and working dedupe controls. The PNG is a browser capture, not a substitute for HTML.

The four exact direct dependencies are pinned in `package.json` and transitives in
`package-lock.json`. No global install, SvelteKit service, external font, analytics,
or hosted deployment is required.

`npm run build` compiles the real `.svx` and `.svelte` files twice: a client bundle
for hydration, and server components for real HTML with their original CSS.
Vite resolves the original `#lib` imports and eager tenant/page globs.
Every KB route is written under `rendered/`; the root opens the signed review.
The build replaces generated `rendered/` files, so capture screenshots again after rebuilding.

### Desk update and ticket dispositions

After the first submission, the course page published `#4471 · closed 05 oct`:
parser **FIXED** (`fix(dates): parse dd/mm for eu locales`), hint **WON'T FIX**
(`booking-v3 form retired`). The signed review now renders those separate outcomes from
[`src/lib/data/desk-update.json`](src/lib/data/desk-update.json), with its source URL and
observation date. The parser issue closes as completed; the hint issue closes as not planned.
Retirement is not a repaired hint, and neither disposition supplies individual verification
of the five anomalous observations. Historical filing counts and original export files remain unchanged.

### Scope and ongoing desk work

The two issue counts are **provisional filing assignments**, not a production root-cause
proof for every report. Five one-day/ordering observations remain visible within the parser
bucket; neither the export nor this repo demonstrates a timezone diagnosis or a production fix.
The proposed decision does not pretend that the support desk has accepted a new policy.

Replace input data only when a newer desk export supplies it. Rebuild to recompute counts,
tenant assignment, anomalies, queue chronology and dedupe examples. This is a snapshot,
not a live feed. The review supplies a data-derived timeline range; the preserved original
timeline component otherwise defaults to October 5 as its exclusive end.
Issue bodies must be updated when their associated filing counts change.
The signature-derived desk reference stays stable for the same signature.

`rendered/` is committed because the Challenge asks for the rendered page as well as source.
Do not commit `node_modules/`, `.npm-cache/` or `.build/`; they are local and ignored.
After finishing, stop the preview and remove those local generated dependency/cache directories
if they are no longer needed. Source, lockfile and rendered evidence remain reproducible.

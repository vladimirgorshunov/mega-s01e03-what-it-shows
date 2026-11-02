import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { causeOf, groupByCause, sameCause, uniqueById } from '../src/lib/kb/causes.ts';
import { daysSince, STALE_AFTER_DAYS } from '../src/lib/kb/staleness.ts';

const data = async (file) => JSON.parse(await readFile(new URL(`../src/lib/data/${file}`, import.meta.url), 'utf8'));
const raw = await data('reports-4471.json');
const reports = uniqueById(raw);
const tenants = new Map();
for (const file of await readdir(new URL('../src/lib/data/tenants/', import.meta.url))) {
  if (!file.endsWith('.json')) continue;
  const tenant = await data(`tenants/${file}`);
  tenants.set(tenant.handle, tenant);
}
const tenantOf = (r) => tenants.get(r.tenant);
const groups = groupByCause(reports, tenantOf);
assert.equal(raw.length, 427, 'baseline export rows');
assert.equal(reports.length, 412, 'overlap must not inflate reports');
assert.deepEqual(groups.map((g) => [g.cause, g.reports.length]), [['parser', 379], ['hint', 33]]);
const notes = await data('desk-notes.json');
assert.equal(notes.oneDayMove.length, 5);
for (const id of notes.oneDayMove) {
  const report = reports.find((r) => r.id === id);
  assert.ok(report, `${id} must remain visible`);
  assert.equal(causeOf(report, tenantOf(report)), 'parser', 'flagged observations stay in the provisional parser bucket');
}
assert.equal(causeOf({ channel: 'form' }, tenants.get('alder.physio')), 'hint');
assert.equal(causeOf({ channel: 'app' }, tenants.get('alder.physio')), 'parser');
assert.equal(causeOf({ channel: 'form' }, tenants.get('kettle.books')), 'parser');
assert.equal(causeOf({ channel: 'form' }, { handle: 'new', name: 'New tenant', locale: 'en-US', form: 'booking-v3' }), null);
assert.equal(sameCause({ channel: 'email' }, undefined, { channel: 'email' }, undefined), false);
const appended = [...reports, { ...reports[0], id: 'future-report' }, reports[0]];
assert.equal(uniqueById(appended).length, 413, 'new reports count; overlapping IDs do not');
assert.equal(daysSince('2026-01-01', new Date('2026-06-30T00:00:00Z')), STALE_AFTER_DAYS);
const rendered = JSON.parse(await readFile(new URL('../rendered/evidence.json', import.meta.url), 'utf8'));
assert.equal(rendered.uniqueReports, reports.length);
assert.deepEqual(rendered.groups.map((g) => [g.cause, g.count]), groups.map((g) => [g.cause, g.reports.length]));
assert.equal(rendered.months.reduce((sum, row) => sum + row.received, 0), reports.length);
assert.equal(rendered.months.reduce((sum, row) => sum + row.merged, 0), reports.length);
console.log('Evidence checks passed: deduplication, tenant/channel assignment, five caveats, future input, staleness boundary, and rendered counts.');

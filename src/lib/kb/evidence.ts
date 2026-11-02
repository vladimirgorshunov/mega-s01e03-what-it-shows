import exportedReports from '#lib/data/reports-4471.json';
import notes from '#lib/data/desk-notes.json';
import issues from '#lib/data/review-issues.json';
import deskUpdate from '#lib/data/desk-update.json';
import { causeOf, dayFirst, groupByCause, uniqueById, type Report } from '#lib/kb/causes';
import { tenantHandles, tenantOf } from '#lib/kb/locales';

const raw = exportedReports as Report[];
export const reports = uniqueById(raw).filter((r) => r.mergedInto === 4471);
export const groups = groupByCause(reports, tenantOf);
export const flagged = reports.filter((r) => notes.oneDayMove.includes(r.id));
const counts = (values: string[]) => values.reduce<Record<string, number>>((all, value) => {
  all[value] = (all[value] ?? 0) + 1;
  return all;
}, {});

export const months = [...new Set(reports.flatMap((r) => [r.receivedAt.slice(0, 7), r.mergedAt?.slice(0, 7)].filter((s): s is string => !!s)))].sort().map((month) => ({
  month,
  received: reports.filter((r) => r.receivedAt.startsWith(month)).length,
  merged: reports.filter((r) => r.mergedAt?.startsWith(month)).length,
}));

const eventDays = reports.flatMap((r) => [r.receivedAt.slice(0, 10), ...(r.mergedAt ? [r.mergedAt.slice(0, 10)] : [])]).sort();
const mondayOf = (day: string) => {
  const date = new Date(day);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.getTime();
};
export const timelineFrom = new Date(mondayOf(eventDays[0])).toISOString().slice(0, 10);
export const timelineTo = new Date(mondayOf(eventDays.at(-1)!) + 7 * 86_400_000).toISOString().slice(0, 10);

export const tenantRows = tenantHandles().map((handle) => {
  const tenant = tenantOf({ tenant: handle })!;
  const assigned = reports.filter((r) => r.tenant === handle);
  return { ...tenant, dayFirst: dayFirst(tenant.locale), counts: counts(assigned.map((r) => causeOf(r, tenant) ?? 'unplaced')) };
});

export const evidence = {
  provenance: 'support-kb export dated 2026-10-04; original source and data preserved',
  ticket: 4471,
  deskUpdate,
  rawRows: raw.length,
  uniqueReports: reports.length,
  duplicateRows: raw.length - uniqueById(raw).length,
  intakeDisagreements: reports.filter((r) => r.meta.intakeTag !== causeOf(r, tenantOf(r))).length,
  browserTenantDisagreements: reports.filter((r) => r.meta.browserLocale !== tenantOf(r)?.locale).length,
  groups: groups.map((g) => ({
    cause: g.cause,
    count: g.reports.length,
    tenants: g.tenants,
    channels: counts(g.reports.map((r) => r.channel)),
    taggedAs: g.taggedAs,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    issue: issues[g.cause as keyof typeof issues] ?? null,
    reportIds: g.reports.map((r) => r.id),
    flaggedIds: g.reports.filter((r) => notes.oneDayMove.includes(r.id)).map((r) => r.id),
  })),
  flagged: flagged.map((r) => ({ ...r, assignedCause: causeOf(r, tenantOf(r)) })),
  months,
  tenants: tenantRows,
};

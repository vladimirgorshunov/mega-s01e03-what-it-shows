<script lang="ts">
  import { evidence, flagged, groups, months, reports, tenantRows } from '#lib/kb/evidence';
  import { causeOf } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  let { section }: { section: 'outcomes' | 'summary' | 'flags' | 'tenants' | 'months' } = $props();
  const parser = groups.find((g) => g.cause === 'parser');
  const parserFlagged = flagged.filter((report) => causeOf(report, tenantOf(report)) === 'parser');
</script>

{#if section === 'outcomes'}
  <p><strong>#{evidence.deskUpdate.ticket} · {evidence.deskUpdate.ticketStateAsShown}</strong> — <a href={evidence.deskUpdate.source}>{evidence.deskUpdate.heading}</a>, observed {evidence.deskUpdate.observedOn}.</p>
  <table>
    <thead><tr><th>problem</th><th>desk outcome</th><th>engineering update</th><th>tracker closure reason</th></tr></thead>
    <tbody>
      {#each evidence.deskUpdate.outcomes as outcome (outcome.cause)}
        <tr><td><code>{outcome.cause}</code></td><td><strong>{outcome.state}</strong></td><td>{outcome.description}</td><td>{outcome.trackerReason}</td></tr>
      {/each}
    </tbody>
  </table>
  <p class="muted">{evidence.deskUpdate.limits}</p>
{:else if section === 'summary'}
  <p class="total"><strong>{evidence.uniqueReports}</strong> unique reports · {evidence.rawRows} export rows · {evidence.duplicateRows} overlapping copies removed</p>
  <p>Current filing: <strong>{groups.length} buckets</strong>. Tenant/channel assignment is evidence, not a proof that every report has the same production root cause.</p>
  <section class="scroll" aria-label="Problem assignments">
    <table>
      <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>received</th><th>new issue</th></tr></thead>
      <tbody>
        {#each evidence.groups as group (group.cause)}
          <tr><td><code>{group.cause}</code></td><td><strong>{group.count}</strong></td><td>{group.tenants}</td><td>{group.firstSeen} → {group.lastSeen}</td><td>{#if group.issue}<a href={group.issue}>issue #{group.issue.split('/').at(-1)}</a>{:else}not filed{/if}</td></tr>
        {/each}
      </tbody>
    </table>
  </section>
  <p class="muted">{evidence.intakeDisagreements} intake tags disagree with tenant/channel assignment. Browser locale differs from tenant locale in {evidence.browserTenantDisagreements} reports. Neither is a reliable cause key.</p>
{:else if section === 'flags'}
  <p><strong>{flagged.length} flagged observations</strong> stay visible within their current filing buckets, not counted again. Of these, <strong>{parserFlagged.length}</strong> currently sit in the provisional parser bucket; excluding that subset leaves <strong>{(parser?.reports.length ?? 0) - parserFlagged.length}</strong> other parser-assigned reports.</p>
  <section class="scroll" aria-label="Unresolved report observations">
    <table>
      <thead><tr><th>report / received</th><th>tenant / channel</th><th>what the reporter said</th><th>filed as</th></tr></thead>
      <tbody>
        {#each flagged as report (report.id)}
          <tr><td><code>{report.id}</code><br />{report.receivedAt.slice(0, 10)}</td><td>{report.tenant}<br />{report.channel}</td><td>{report.body}</td><td><code>{causeOf(report, tenantOf(report)) ?? 'unplaced'}</code></td></tr>
        {/each}
      </tbody>
    </table>
  </section>
{:else if section === 'tenants'}
  <section class="scroll" aria-label="All tenant assignments">
    <table>
      <thead><tr><th>tenant</th><th>locale</th><th>day first?</th><th>form</th><th>parser</th><th>hint</th></tr></thead>
      <tbody>
        {#each tenantRows as tenant (tenant.handle)}
          <tr><td>{tenant.handle}</td><td>{tenant.locale}</td><td>{tenant.dayFirst ? 'yes' : 'no'}</td><td>{tenant.form}</td><td>{tenant.counts.parser ?? 0}</td><td>{tenant.counts.hint ?? 0}</td></tr>
        {/each}
      </tbody>
    </table>
  </section>
{:else if section === 'months'}
  <table>
    <thead><tr><th>month</th><th>reports received</th><th>reports merged</th></tr></thead>
    <tbody>{#each months as row (row.month)}<tr><td>{row.month}</td><td>{row.received}</td><td>{row.merged}</td></tr>{/each}</tbody>
  </table>
  {@const batch = reports.filter((r) => r.mergedAt?.startsWith('2026-07-02'))}
  {@const backlog = batch.filter((r) => r.receivedAt.slice(0, 10) < '2026-07-01')}
  <p>On 2026-07-02 the desk merged <strong>{batch.length}</strong> reports, including <strong>{backlog.length}</strong> received in April–June. That spike measures desk processing, not a new July onset.</p>
{/if}

<style>
  .total { font-size: 1.15rem; padding: 0.75rem 0; border-top: 2px solid var(--accent); border-bottom: 1px solid var(--line); }
  .total strong { font-size: 1.5em; color: var(--accent); }
  .muted { color: var(--muted); font-size: 0.9rem; }
  .scroll { overflow-x: auto; }
  td { vertical-align: top; }
</style>

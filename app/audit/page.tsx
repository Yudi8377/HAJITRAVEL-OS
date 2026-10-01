import { redirect } from 'next/navigation'
import { resolveAccessContext } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AuditPage() {
  const access = await resolveAccessContext()
  if (!access.authenticated) redirect('/login?next=/audit')
  if (!access.organizationId || !access.capabilities.includes('audit.read')) {
    return <main className="modulePage"><section className="dashCard"><span className="eyebrow">ACCESS CONTROL</span><h1>Audit & Evidence</h1><p>Akses membutuhkan organization scope dan audit.read.</p></section></main>
  }

  const sb = await createServerSupabaseClient()
  const { data, error } = await sb.schema('audit').from('events')
    .select('id,action,actor_user_id,entity_schema,entity_table,entity_id,correlation_id,event_at,metadata')
    .eq('organization_id', access.organizationId)
    .order('event_at', { ascending: false })
    .limit(100)

  if (error) throw error

  return <main className="modulePage">
    <section className="moduleHero">
      <div><span className="eyebrow">DOMAIN · AUDIT & EVIDENCE</span><h1>Audit & Evidence</h1><p>Immutable operational evidence stream untuk menelusuri actor, action, entity, correlation dan waktu kejadian dalam organization scope.</p></div>
      <div className="moduleHeroStamp">TRACE<br/>CONTROL</div>
    </section>

    <section className="opsMetrics">
      <Metric label="Events" value={data?.length ?? 0} />
      <Metric label="Window" value="Latest 100" />
      <Metric label="Scope" value="Organization" />
      <Metric label="Mode" value="Read only" />
    </section>

    <section className="dashCard">
      <div className="dashHead"><div><span className="eyebrow">EVENT STREAM</span><h3>Recent audit evidence</h3></div></div>
      {(data?.length ?? 0) === 0 ? <div className="emptyState">Belum ada audit event untuk organization ini.</div> :
        <div className="riskList">{data!.map((x:any) => <div className="riskRow" key={x.id}>
          <div className="riskMain">
            <div className="riskTop"><b>{x.action}</b><span>{x.entity_schema && x.entity_table ? x.entity_schema+'.'+x.entity_table : 'system'}</span></div>
            <strong>{x.entity_id ?? 'No entity id'}</strong>
            <small>{x.actor_user_id ? 'Actor '+x.actor_user_id : 'System actor'} · Correlation {x.correlation_id ?? '—'}</small>
          </div>
          <div className="riskMeta"><span>{x.event_at ? new Date(x.event_at).toLocaleString('id-ID') : '—'}</span><span>{x.metadata ? 'Evidence attached' : 'No metadata'}</span></div>
        </div>)}</div>}
    </section>
  </main>
}

function Metric({label,value}:{label:string,value:string|number}) {
  return <div className="opsMetric"><span>{label}</span><b>{value}</b></div>
}

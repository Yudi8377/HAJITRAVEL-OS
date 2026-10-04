import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, ArrowUpRight, BrainCircuit, HeartPulse, Landmark, Network, ShieldCheck, Users, WalletCards } from 'lucide-react'
import { resolveAccessContext } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type QueryResult = { data: any[]; error: any | null }
const empty = (): QueryResult => ({ data: [], error: null })
async function safeQuery<T>(factory: () => PromiseLike<{ data: T[] | null; error: any }>): Promise<QueryResult> {
  try {
    const r = await factory()
    return { data: r.data ?? [], error: r.error ?? null }
  } catch (error) {
    return { data: [], error }
  }
}

export default async function ControlCenter() {
  const access = await resolveAccessContext()
  if (!access.authenticated) redirect('/login?next=/control-center')
  if (!access.organizationId || !access.capabilities.includes('reports.read')) {
    return <main className="modulePage"><section className="dashCard"><span className="eyebrow">ACCESS CONTROL</span><h1>Enterprise Control Plane</h1><p>Akses membutuhkan organization scope dan reports.read.</p></section></main>
  }

  const sb = await createServerSupabaseClient()
  const org = access.organizationId
  const [health, procurement, suppliers, hr, grc, regulatory, ai, bi, integrations, controlItems, invoices, payments, incidents, audit] = await Promise.all([
    safeQuery(() => sb.schema('health').from('signals').select('id,status,severity').eq('organization_id', org)),
    safeQuery(() => sb.schema('procurement').from('purchase_requests').select('id,status,amount').eq('organization_id', org)),
    safeQuery(() => sb.schema('supplier').from('suppliers').select('id,status,risk_level').eq('organization_id', org)),
    safeQuery(() => sb.schema('hr').from('staff').select('id,status').eq('organization_id', org)),
    safeQuery(() => sb.schema('grc').from('controls').select('id,status').eq('organization_id', org)),
    safeQuery(() => sb.schema('regulatory').from('obligations').select('id,status').eq('organization_id', org)),
    safeQuery(() => sb.schema('ai').from('agent_runs').select('id,status,policy_gate,confidence').eq('organization_id', org)),
    safeQuery(() => sb.schema('bi').from('metric_snapshots').select('id,quality_status').eq('organization_id', org)),
    safeQuery(() => sb.schema('integration').from('endpoint_registry').select('id,status').eq('organization_id', org)),
    safeQuery(() => sb.schema('operations').from('enterprise_control_items').select('id,domain,source_table,source_id,state,priority,title,detail,due_at,owner_user_id,evidence_uri').eq('organization_id', org).order('due_at',{ascending:true}).limit(12)),
    safeQuery(() => sb.schema('finance').from('invoices').select('id,amount,status').eq('organization_id', org)),
    safeQuery(() => sb.schema('finance').from('payments').select('id,amount,status').eq('organization_id', org)),
    safeQuery(() => sb.schema('safety').from('incidents').select('id,status,severity').eq('organization_id', org)),
    safeQuery(() => sb.schema('audit').from('events').select('id,action,entity_schema,entity_table,event_at').eq('organization_id', org).order('event_at',{ascending:false}).limit(8))
  ])

  const failedDomains = [
    ['Health',health],['Procurement',procurement],['Supplier',suppliers],['HR',hr],['GRC',grc],['Regulatory',regulatory],['AI',ai],['BI',bi],['Integration',integrations],['Control',controlItems],['Finance',invoices],['Payments',payments],['Safety',incidents],['Audit',audit]
  ].filter(([,r]:any)=>r.error).map(([name]:any)=>name)

  const count = (x:any[]) => x.length
  const openHealth = health.data.filter((x:any)=>['OPEN','ESCALATED'].includes(x.status)).length
  const procurementOpen = procurement.data.filter((x:any)=>['SUBMITTED','APPROVED','ORDERED'].includes(x.status)).length
  const grcExposure = grc.data.filter((x:any)=>['FAIL','EXCEPTION','OPEN'].includes(x.status)).length
  const regulatoryAction = regulatory.data.filter((x:any)=>x.status==='ACTION_REQUIRED').length
  const aiReview = ai.data.filter((x:any)=>x.status==='REVIEW_REQUIRED' || x.policy_gate==='HUMAN_REVIEW').length
  const integrationActive = integrations.data.filter((x:any)=>x.status==='ACTIVE').length
  const critical = [...health.data,...incidents.data,...controlItems.data].filter((x:any)=>x.severity==='CRITICAL'||x.priority==='CRITICAL').length
  const outstanding = invoices.data.filter((x:any)=>['ISSUED','PARTIAL','OVERDUE'].includes(x.status)).reduce((s:number,x:any)=>s+Number(x.amount||0),0)
  const confirmed = payments.data.filter((x:any)=>x.status==='CONFIRMED').reduce((s:number,x:any)=>s+Number(x.amount||0),0)
  const money = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0})

  return <main className="modulePage">
    <section className="moduleHero"><div><span className="eyebrow">HAJITRAVEL OS · INTEGRATED ENTERPRISE CONTROL</span><h1>Enterprise Control Plane</h1><p>Health, safety, finance, procurement, supplier, people, GRC, regulatory intelligence, AI, BI dan integrations berada dalam satu organization-scoped control surface.</p></div><div className="moduleHeroStamp">INTEGRATED<br/>CONTROL</div></section>
    {failedDomains.length>0 && <section className="dashCard" style={{marginTop:14,border:'1px solid rgba(184,134,11,.35)'}}><span className="eyebrow">PARTIAL DATA AVAILABILITY</span><h3>Control Tower tetap aktif</h3><p>{failedDomains.length} domain belum dapat dibaca pada request ini. Data yang tersedia tetap ditampilkan; tidak ada domain failure yang menjatuhkan seluruh dashboard.</p></section>}
    <section className="opsMetrics">
      <Metric icon={HeartPulse} label="Health signals" value={count(health.data)} note={openHealth+' open / escalated'} /><Metric icon={ShieldCheck} label="Safety incidents" value={count(incidents.data)} note={critical+' critical control signals'} /><Metric icon={WalletCards} label="Finance exposure" value={money.format(outstanding)} note={money.format(confirmed)+' confirmed payments'} /><Metric icon={Landmark} label="Procurement" value={count(procurement.data)} note={procurementOpen+' active requests'} /><Metric icon={Users} label="People" value={count(hr.data)} note={count(suppliers.data)+' suppliers'} /><Metric icon={ShieldCheck} label="GRC / Regulatory" value={grcExposure+regulatoryAction} note={grcExposure+' controls + '+regulatoryAction+' actions'} /><Metric icon={BrainCircuit} label="AI governance" value={count(ai.data)} note={aiReview+' human reviews'} /><Metric icon={Network} label="Integrations" value={integrationActive} note={count(integrations.data)+' registered endpoints'} />
    </section>
    <div className="riskSplit">
      <section className="dashCard"><div className="dashHead"><div><span className="eyebrow">ENTERPRISE ACTION QUEUE</span><h3>Cross-domain controls</h3></div><Activity size={17}/></div>{controlItems.data.length===0?<div className="emptyState">Belum ada enterprise control item. Sistem siap menerima exception, SLA, evidence, dan action lintas domain.</div>:<div className="riskList">{controlItems.data.map((x:any)=><div className="riskRow" key={x.id}><div className="riskMain"><div className="riskTop"><b>{x.domain}</b><span className={String(x.priority).toLowerCase()}>{x.priority}</span></div><strong>{x.title}</strong><small>{x.detail??'No detail recorded.'}</small></div><div className="riskMeta"><span>{x.state}</span><span>{x.due_at?new Date(x.due_at).toLocaleString('id-ID'):'No due date'}</span></div></div>)}</div>}</section>
      <section className="dashCard"><div className="dashHead"><div><span className="eyebrow">DOMAIN COVERAGE</span><h3>System surfaces</h3></div></div><div className="attention"><Surface href="/safety-admin" label="Safety & Incident" value={String(count(incidents.data))}/><Surface href="/finance" label="Finance & Payment" value={money.format(outstanding)}/><Surface href="/operations" label="Operations & Departure" value="Control Tower"/><Surface href="/audit" label="Audit & Evidence" value="Traceable"/><Surface href="/admin" label="Executive Command" value="Open dashboard"/></div></section>
    </div>
    <section className="dashCard" style={{marginTop:14}}><div className="dashHead"><div><span className="eyebrow">AUDIT STREAM</span><h3>Cross-domain trace</h3></div><Link href="/audit">Open audit <ArrowUpRight size={14}/></Link></div>{audit.data.length===0?<div className="emptyState">Belum ada audit event lintas domain.</div>:<div className="activity">{audit.data.map((x:any)=><p key={x.id}><b>{x.action}</b> <span>{x.entity_schema&&x.entity_table?x.entity_schema+'.'+x.entity_table:'system'}</span> <small>{x.event_at?new Date(x.event_at).toLocaleString('id-ID'):''}</small></p>)}</div>}</section>
    <section className="dashCard" style={{marginTop:14}}><div className="dashHead"><div><span className="eyebrow">OPERATING PRINCIPLES</span><h3>Guardrails active</h3></div></div><div className="moduleTiles"><div><ShieldCheck size={18}/><div><b>Organization scoped</b><span>Cross-domain rows are constrained to the active organization.</span></div></div><div><HeartPulse size={18}/><div><b>Health = signal</b><span>Operational risk signal only; not medical diagnosis.</span></div></div><div><BrainCircuit size={18}/><div><b>AI = governed</b><span>Provenance, confidence, policy gate and human review are stored.</span></div></div><div><Network size={18}/><div><b>Integration = controlled</b><span>Endpoints are registered before activation and observable.</span></div></div></div></section>
  </main>
}

function Metric({icon:Icon,label,value,note}:{icon:any,label:string,value:string|number,note:string}){return <div className="opsMetric"><Icon size={16}/><span>{label}</span><b>{value}</b><small>{note}</small></div>}
function Surface({href,label,value}:{href:string,label:string,value:string}){return <Link href={href} className="action"><span><b>{label}</b><small>{value}</small></span><ArrowUpRight size={14}/></Link>}

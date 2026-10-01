import { createServerSupabaseClient } from '../lib/supabase/server'
import { requireCapability } from '../access/runtime'

export type DashboardDeparture = {
  id: string
  code: string
  departureDate: string
  returnDate: string | null
  capacity: number
  status: string
  packageName: string | null
  groupCode: string | null
  jamaahCount: number
  readiness: number | null
  blockers: number
  exceptions: number
  critical: number
  high: number
  overdue: number
  operationalReady: boolean | null
  flightReady: boolean | null
  hotelReady: boolean | null
  transportReady: boolean | null
}

export type DashboardSnapshot = {
  organizationName: string
  jamaahCount: number
  departureCount: number
  outstanding: number
  readiness: number | null
  upcoming: DashboardDeparture[]
  attention: { documents: number; invoices: number; departures: number; incidents: number }
  portfolioHealth: number | null
  portfolioState: string | null
  executiveState: string | null
  executive: { critical: number; high: number; overdue: number; activeExceptions: number; due4h: number; due24h: number; dataQuality: number }
  actionQueue: Array<{ departureId: string; departureCode: string; departureDate: string; priority: string; riskScore: number; driver: string | null; focus: string | null; blockers: number }>
  audit: Array<{ id: number; action: string; entity: string; eventAt: string }>
}

function sum(values: Array<number | string | null | undefined>) {
  return values.reduce<number>((total, value) => total + Number(value ?? 0), 0)
}
function round(value: number) { return Math.round(value * 100) / 100 }

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const access = await requireCapability('reports.read')
  const organizationId = access.organizationId!
  const sb = await createServerSupabaseClient()
  const [org, jamaah, departures, invoices, payments, reviews, cases, audit, tower, control, snapshot, sla, actions] = await Promise.all([
    sb.schema('organization').from('organizations').select('trade_name,legal_name').eq('id', organizationId).single(),
    sb.schema('jamaah').from('profiles').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    sb.schema('operations').from('departures').select('id,departure_code,departure_date,return_date,capacity,status,package_id,packages(name)').eq('organization_id', organizationId).gte('departure_date', new Date().toISOString().slice(0, 10)).order('departure_date', { ascending: true }).limit(8),
    sb.schema('finance').from('invoices').select('id,amount,status').eq('organization_id', organizationId),
    sb.schema('finance').from('payments').select('invoice_id,amount,status').eq('organization_id', organizationId),
    sb.schema('compliance').from('reviews').select('id,status').eq('organization_id', organizationId),
    sb.schema('incidents').from('cases').select('id,status,severity').eq('organization_id', organizationId).in('status', ['OPEN','TRIAGED','ACTIONED']),
    sb.schema('audit').from('events').select('id,action,entity_schema,entity_table,event_at').eq('organization_id', organizationId).order('event_at', { ascending: false }).limit(6),
    sb.schema('operations').from('departure_control_tower').select('*').eq('organization_id', organizationId).gte('departure_date', new Date().toISOString().slice(0, 10)).order('departure_date', { ascending: true }).limit(8),
    sb.schema('operations').from('executive_control_summary').select('*').eq('organization_id', organizationId).maybeSingle(),
    sb.schema('operations').from('executive_operational_snapshot').select('*').eq('organization_id', organizationId).maybeSingle(),
    sb.schema('operations').from('executive_sla_aging').select('*').eq('organization_id', organizationId).maybeSingle(),
    sb.schema('operations').from('departure_executive_action_queue').select('*').eq('organization_id', organizationId).order('predictive_risk_score', { ascending: false }).limit(6),
  ])
  for (const result of [org,jamaah,departures,invoices,payments,reviews,cases,audit,tower,control,snapshot,sla,actions]) if (result.error) throw result.error
  const departureRows = departures.data ?? []
  const towerRows = tower.data ?? []
  const towerById = new Map(towerRows.map((row:any) => [row.departure_id, row]))
  const departureIds = departureRows.map((row: any) => row.id)
  const groups = departureIds.length ? await sb.schema('operations').from('groups').select('id,departure_id,group_code').in('departure_id', departureIds) : {data:[],error:null}
  if (groups.error) throw groups.error
  const groupIds = (groups.data ?? []).map((row: any) => row.id)
  const members = groupIds.length ? await sb.schema('operations').from('group_members').select('group_id,jamaah_id,member_status').in('group_id', groupIds) : {data:[],error:null}
  if (members.error) throw members.error
  const paidByInvoice = new Map<string, number>()
  for (const payment of payments.data ?? []) if (payment.status === 'CONFIRMED') paidByInvoice.set(payment.invoice_id, (paidByInvoice.get(payment.invoice_id) ?? 0) + Number(payment.amount ?? 0))
  const outstanding = sum((invoices.data ?? []).filter((invoice:any)=>['ISSUED','PARTIAL','OVERDUE'].includes(invoice.status)).map((invoice:any)=>Math.max(0,Number(invoice.amount ?? 0)-(paidByInvoice.get(invoice.id) ?? 0))))
  const openReviews = (reviews.data ?? []).filter((row:any)=>['OPEN','GAP','REVIEW_REQUIRED'].includes(row.status)).length
  const invoiceAttention = (invoices.data ?? []).filter((row:any)=>['ISSUED','PARTIAL','OVERDUE'].includes(row.status)).length
  const incidentAttention = (cases.data ?? []).length
  const actionRows:any[] = actions.data ?? []
  const actionByDeparture = new Map(actionRows.map((row:any)=>[row.departure_id,row]))
  const upcoming: DashboardDeparture[] = departureRows.map((departure:any)=>{
    const departureGroups=(groups.data ?? []).filter((group:any)=>group.departure_id===departure.id)
    const departureGroupIds=new Set(departureGroups.map((group:any)=>group.id))
    const jamaahCount=(members.data ?? []).filter((member:any)=>departureGroupIds.has(member.group_id)&&member.member_status!=='CANCELLED').length
    const controlRow:any = towerById.get(departure.id)
    const actionRow:any = actionByDeparture.get(departure.id)
    const readinessParts = [controlRow?.documents_complete,controlRow?.consents_complete,controlRow?.finance_complete,controlRow?.manifest_complete,controlRow?.checklist_ready,controlRow?.flight_ready,controlRow?.hotel_ready,controlRow?.transport_ready].filter((value): value is boolean => typeof value === 'boolean')
    const readiness = controlRow?.operational_readiness != null ? (controlRow.operational_readiness ? 100 : readinessParts.length ? round(readinessParts.filter(Boolean).length/readinessParts.length*100) : 0) : readinessParts.length ? round(readinessParts.filter(Boolean).length/readinessParts.length*100) : null
    return {id:departure.id,code:departure.departure_code,departureDate:departure.departure_date,returnDate:departure.return_date,capacity:departure.capacity,status:departure.status,packageName:departure.packages?.name ?? null,groupCode:departureGroups[0]?.group_code ?? null,jamaahCount,readiness,blockers:Number(controlRow?.blockers_count ?? actionRow?.blockers_count ?? 0),exceptions:Number(actionRow?.exception_count ?? 0),critical:Number(actionRow?.critical_count ?? 0),high:Number(actionRow?.high_count ?? 0),overdue:Number(actionRow?.overdue_count ?? 0),operationalReady:controlRow?.operational_readiness ?? null,flightReady:controlRow?.flight_ready ?? null,hotelReady:controlRow?.hotel_ready ?? null,transportReady:controlRow?.transport_ready ?? null}
  })
  const readinessValues:number[]=upcoming.map((item:DashboardDeparture)=>item.readiness).filter((value):value is number=>value!==null)
  const controlData:any = control.data ?? snapshot.data ?? null
  const slaData:any = sla.data ?? null
  const actionQueue = actionRows.map((row:any)=>({departureId:row.departure_id,departureCode:row.departure_code,departureDate:row.departure_date,priority:row.predictive_priority ?? row.governance_state ?? 'WATCH',riskScore:Number(row.predictive_risk_score ?? 0),driver:row.primary_risk_driver ?? null,focus:row.recommended_focus ?? null,blockers:Number(row.blockers_count ?? 0)}))
  const executive:any = control.data ?? snapshot.data ?? null
  const snapshotData:any = snapshot.data ?? null
  return {organizationName:org.data?.trade_name||org.data?.legal_name||'HAJI TRAVEL OS',jamaahCount:jamaah.count??0,departureCount:Number(controlData?.departure_count ?? departureRows.length),outstanding,readiness:readinessValues.length?round(sum(readinessValues)/readinessValues.length):null,portfolioHealth:controlData?.portfolio_health_score != null ? Number(controlData.portfolio_health_score) : null,portfolioState:controlData?.portfolio_risk_state ?? null,executiveState:controlData?.executive_control_state ?? null,upcoming,attention:{documents:openReviews,invoices:invoiceAttention,departures:upcoming.filter(item=>item.readiness!==null&&item.readiness<80).length,incidents:incidentAttention},executive:{critical:Number(executive?.p1_critical_count ?? slaData?.critical_count ?? 0),high:Number(executive?.p2_high_count ?? slaData?.high_count ?? 0),overdue:Number(executive?.overdue_count ?? slaData?.overdue_count ?? 0),activeExceptions:Number(snapshotData?.active_exception_count ?? executive?.exception_count ?? slaData?.active_exception_count ?? 0),due4h:Number(snapshotData?.sla_due_within_4h ?? slaData?.due_within_4h ?? 0),due24h:Number(snapshotData?.sla_due_within_24h ?? slaData?.due_within_24h ?? 0),dataQuality:Number(executive?.data_quality_issue_count ?? 0)},actionQueue,audit:(audit.data??[]).map((event:any)=>({id:event.id,action:event.action,entity:[event.entity_schema,event.entity_table].filter(Boolean).join('.'),eventAt:event.event_at}))}
}
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
}

export type DashboardSnapshot = {
  organizationName: string
  jamaahCount: number
  departureCount: number
  outstanding: number
  readiness: number | null
  upcoming: DashboardDeparture[]
  attention: { documents: number; invoices: number; departures: number; incidents: number }
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
  const [org, jamaah, departures, invoices, payments, reviews, cases, audit] = await Promise.all([
    sb.schema('organization').from('organizations').select('trade_name,legal_name').eq('id', organizationId).single(),
    sb.schema('jamaah').from('profiles').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    sb.schema('operations').from('departures').select('id,departure_code,departure_date,return_date,capacity,status,package_id,packages(name)').eq('organization_id', organizationId).gte('departure_date', new Date().toISOString().slice(0, 10)).order('departure_date', { ascending: true }).limit(8),
    sb.schema('finance').from('invoices').select('id,amount,status').eq('organization_id', organizationId),
    sb.schema('finance').from('payments').select('invoice_id,amount,status').eq('organization_id', organizationId),
    sb.schema('compliance').from('reviews').select('id,status').eq('organization_id', organizationId),
    sb.schema('incidents').from('cases').select('id,status,severity').eq('organization_id', organizationId).in('status', ['OPEN','TRIAGED','ACTIONED']),
    sb.schema('audit').from('events').select('id,action,entity_schema,entity_table,event_at').eq('organization_id', organizationId).order('event_at', { ascending: false }).limit(6),
  ])
  for (const result of [org,jamaah,departures,invoices,payments,reviews,cases,audit]) if (result.error) throw result.error
  const departureRows = departures.data ?? []
  const departureIds = departureRows.map((row: any) => row.id)
  const groups = departureIds.length ? await sb.schema('operations').from('groups').select('id,departure_id,group_code').in('departure_id', departureIds) : {data:[],error:null}
  if (groups.error) throw groups.error
  const groupIds = (groups.data ?? []).map((row: any) => row.id)
  const members = groupIds.length ? await sb.schema('operations').from('group_members').select('group_id,jamaah_id,member_status').in('group_id', groupIds) : {data:[],error:null}
  if (members.error) throw members.error
  const checklists = departureIds.length ? await sb.schema('operations').from('service_checklists').select('departure_id,required,completed').in('departure_id', departureIds) : {data:[],error:null}
  if (checklists.error) throw checklists.error
  const paidByInvoice = new Map<string, number>()
  for (const payment of payments.data ?? []) if (payment.status === 'CONFIRMED') paidByInvoice.set(payment.invoice_id, (paidByInvoice.get(payment.invoice_id) ?? 0) + Number(payment.amount ?? 0))
  const outstanding = sum((invoices.data ?? []).filter((invoice:any)=>['ISSUED','PARTIAL','OVERDUE'].includes(invoice.status)).map((invoice:any)=>Math.max(0,Number(invoice.amount ?? 0)-(paidByInvoice.get(invoice.id) ?? 0))))
  const openReviews = (reviews.data ?? []).filter((row:any)=>['OPEN','GAP','REVIEW_REQUIRED'].includes(row.status)).length
  const invoiceAttention = (invoices.data ?? []).filter((row:any)=>['ISSUED','PARTIAL','OVERDUE'].includes(row.status)).length
  const incidentAttention = (cases.data ?? []).length
  const upcoming: DashboardDeparture[] = departureRows.map((departure:any)=>{
    const departureGroups=(groups.data ?? []).filter((group:any)=>group.departure_id===departure.id)
    const departureGroupIds=new Set(departureGroups.map((group:any)=>group.id))
    const jamaahCount=(members.data ?? []).filter((member:any)=>departureGroupIds.has(member.group_id)&&member.member_status!=='CANCELLED').length
    const checklistRows=(checklists.data ?? []).filter((item:{departure_id:string;required:boolean;completed:boolean})=>item.departure_id===departure.id&&item.required)
    const readiness=checklistRows.length?round(checklistRows.filter((item:{completed:boolean})=>item.completed).length/checklistRows.length*100):null
    return {id:departure.id,code:departure.departure_code,departureDate:departure.departure_date,returnDate:departure.return_date,capacity:departure.capacity,status:departure.status,packageName:departure.packages?.name ?? null,groupCode:departureGroups[0]?.group_code ?? null,jamaahCount,readiness}
  })
  const readinessValues:number[]=upcoming.map((item:DashboardDeparture)=>item.readiness).filter((value):value is number=>value!==null)
  return {organizationName:org.data?.trade_name||org.data?.legal_name||'HAJI TRAVEL OS',jamaahCount:jamaah.count??0,departureCount:departureRows.length,outstanding,readiness:readinessValues.length?round(sum(readinessValues)/readinessValues.length):null,upcoming,attention:{documents:openReviews,invoices:invoiceAttention,departures:upcoming.filter(item=>item.readiness!==null&&item.readiness<80).length,incidents:incidentAttention},audit:(audit.data??[]).map((event:any)=>({id:event.id,action:event.action,entity:[event.entity_schema,event.entity_table].filter(Boolean).join('.'),eventAt:event.event_at}))}
}
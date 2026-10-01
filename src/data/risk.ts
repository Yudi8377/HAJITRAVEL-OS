import { createServerSupabaseClient } from '../lib/supabase/server'
import { requireCapability } from '../access/runtime'

export type RiskException = {
  departureId: string
  departureCode: string
  departureDate: string
  departureStatus: string
  jamaahId: string | null
  exceptionCode: string
  severity: string
  slaDueAt: string | null
  escalationState: string | null
  caseId: string | null
  caseNo: string | null
  caseStatus: string | null
  assignedTo: string | null
  evidenceUri: string | null
  resolution: string | null
  resolvedAt: string | null
  hasAuditEvidence: boolean
}

export type RiskSnapshot = {
  exceptions: RiskException[]
  totals: { active: number; overdue: number; critical: number; high: number; due4h: number; due24h: number }
  evidenceCount: number
}

export async function getRiskSnapshot(): Promise<RiskSnapshot> {
  const access = await requireCapability('reports.read')
  const organizationId = access.organizationId!
  const sb = await createServerSupabaseClient()
  const [feed, sla, evidence] = await Promise.all([
    sb.schema('operations').from('departure_exception_feed').select('*').eq('organization_id', organizationId).order('sla_due_at', { ascending: true, nullsFirst: false }).limit(100),
    sb.schema('operations').from('executive_sla_aging').select('*').eq('organization_id', organizationId).maybeSingle(),
    sb.schema('operations').from('audit_evidence_index').select('audit_event_id,entity_id,entity_schema,entity_table,event_at').eq('organization_id', organizationId).order('event_at', { ascending: false }).limit(500),
  ])
  for (const result of [feed, sla, evidence]) if (result.error) throw result.error
  const evidenceRows = evidence.data ?? []
  const evidenceIds = new Set(evidenceRows.map((row:any) => row.entity_id).filter(Boolean))
  const exceptions: RiskException[] = (feed.data ?? []).map((row:any) => ({
    departureId: row.departure_id,
    departureCode: row.departure_code,
    departureDate: row.departure_date,
    departureStatus: row.departure_status,
    jamaahId: row.jamaah_id ?? null,
    exceptionCode: row.exception_code,
    severity: row.severity,
    slaDueAt: row.sla_due_at ?? null,
    escalationState: row.escalation_state ?? null,
    caseId: row.case_id ?? null,
    caseNo: row.case_no ?? null,
    caseStatus: row.case_status ?? null,
    assignedTo: row.assigned_to ?? null,
    evidenceUri: row.evidence_uri ?? null,
    resolution: row.resolution ?? null,
    resolvedAt: row.resolved_at ?? null,
    hasAuditEvidence: Boolean((row.case_id && evidenceIds.has(row.case_id)) || (row.departure_id && evidenceIds.has(row.departure_id))),
  }))
  const s:any = sla.data ?? {}
  return {
    exceptions,
    totals: {
      active: Number(s.active_exception_count ?? exceptions.length),
      overdue: Number(s.overdue_count ?? 0),
      critical: Number(s.critical_count ?? 0),
      high: Number(s.high_count ?? 0),
      due4h: Number(s.due_within_4h ?? 0),
      due24h: Number(s.due_within_24h ?? 0),
    },
    evidenceCount: evidenceRows.length,
  }
}

import { AlertTriangle, Clock3, FileCheck2, ShieldAlert } from 'lucide-react'
import { getRiskSnapshot } from '../../src/data/risk'

function severityClass(value:string){ const s=value.toUpperCase(); return s.includes('CRITICAL')||s==='P1'?'critical':s.includes('HIGH')||s==='P2'?'high':'watch' }
function slaLabel(value:string|null){ if(!value) return 'No SLA'; const t=new Date(value).getTime()-Date.now(); if(t<0) return 'OVERDUE'; if(t<=4*60*60*1000) return '< 4H'; if(t<=24*60*60*1000) return '< 24H'; return 'SCHEDULED' }

export default async function Page(){
  const data=await getRiskSnapshot()
  return <main className="modulePage">
    <div className="moduleHero"><div><span className="eyebrow">DOMAIN 05 · RISK & EXCEPTION CENTER</span><h1>Risk & Exception Center</h1><p>Single control surface untuk exception aktif, escalation, SLA aging, dan jejak evidence audit sebelum keputusan operasional dibuat.</p></div><div className="moduleHeroStamp">RISK<br/>CONTROL</div></div>
    <section className="opsMetrics">
      <Metric label="Active exceptions" value={data.totals.active} icon={AlertTriangle}/>
      <Metric label="P1 Critical" value={data.totals.critical} icon={ShieldAlert}/>
      <Metric label="SLA Overdue" value={data.totals.overdue} icon={Clock3}/>
      <Metric label="Audit evidence" value={data.evidenceCount} icon={FileCheck2}/>
    </section>
    <section className="riskSplit">
      <div className="sectionCard"><div className="dashHead"><div><span className="eyebrow">EXCEPTION FEED</span><h3>Active operational exceptions</h3></div><span className="riskSummary">{data.totals.high} HIGH · {data.totals.due4h} DUE &lt;4H</span></div>
        {data.exceptions.length===0?<div className="emptyState">Belum ada exception aktif pada organization scope ini.</div>:<div className="riskList">{data.exceptions.map((item,i)=><article className="riskRow" key={(item.caseId??item.departureId)+'-'+item.exceptionCode+'-'+i}><div className="riskMain"><div className="riskTop"><b>{item.exceptionCode}</b><span className={severityClass(item.severity)}>{item.severity}</span><span>{slaLabel(item.slaDueAt)}</span></div><strong>{item.departureCode}</strong><small>{item.departureDate} · {item.departureStatus} · {item.caseNo ?? 'No case number'}</small></div><div className="riskMeta"><span>{item.escalationState ?? 'UNASSIGNED STATE'}</span><span>{item.caseStatus ?? 'NO CASE'}</span><span>{item.hasAuditEvidence || item.evidenceUri ? 'EVIDENCE LINKED' : 'EVIDENCE PENDING'}</span></div></article>)}</div>}
      </div>
      <div className="sectionCard"><div className="dashHead"><div><span className="eyebrow">SLA AGING</span><h3>Executive exposure</h3></div></div><div className="slaPanel"><Sla label="Active" value={data.totals.active}/><Sla label="Overdue" value={data.totals.overdue}/><Sla label="Due within 4h" value={data.totals.due4h}/><Sla label="Due within 24h" value={data.totals.due24h}/><Sla label="High severity" value={data.totals.high}/></div><div className="evidenceNote"><FileCheck2 size={16}/><div><b>Evidence traceability</b><span>{data.evidenceCount} audit evidence records indexed for this organization.</span></div></div></div>
    </section>
  </main>
}
function Metric({label,value,icon:Icon}:{label:string,value:number,icon:typeof AlertTriangle}){return <div className="opsMetric"><Icon size={16}/><span>{label}</span><b>{value}</b></div>}
function Sla({label,value}:{label:string,value:number}){return <div className="slaRow"><span>{label}</span><b>{value}</b></div>}

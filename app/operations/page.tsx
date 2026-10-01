import { ArrowUpRight, Clock3, ShieldAlert, Plane, CheckCircle2 } from 'lucide-react'
import { getDashboardSnapshot } from '../../src/data/dashboard'

export default async function Page(){
  const data=await getDashboardSnapshot()
  return <main className="modulePage">
    <div className="moduleHero">
      <div><span className="eyebrow">DOMAIN 04 · OPERATIONS</span><h1>Departure Operations</h1><p>Control room operasional untuk readiness, exception, SLA, dan tindakan sebelum keberangkatan.</p></div>
      <div className="moduleHeroStamp">LIVE<br/>CONTROL</div>
    </div>
    <section className="opsMetrics">
      <Metric label="Departures" value={data.departureCount} icon={Plane}/>
      <Metric label="Readiness" value={data.readiness == null ? '—' : `${data.readiness}%`} icon={CheckCircle2}/>
      <Metric label="P1 Critical" value={data.executive.critical} icon={ShieldAlert}/>
      <Metric label="SLA Overdue" value={data.executive.overdue} icon={Clock3}/>
    </section>
    <section className="opsGrid">
      <div className="sectionCard"><div className="dashHead"><div><span className="eyebrow">DEPARTURE INTELLIGENCE</span><h3>Upcoming departures</h3></div></div>
        <div className="opsList">{data.upcoming.map(item=><div className="opsRow" key={item.id}><div><b>{item.code}</b><span>{item.departureDate} · {item.packageName ?? 'Package pending'}</span><small>{item.jamaahCount}/{item.capacity} jamaah · {item.blockers} blockers</small></div><strong className={item.readiness==null?'unknown':item.readiness>=80?'ready':item.readiness>=60?'watch':'risk'}>{item.readiness==null?'UNKNOWN':`${item.readiness}%`}</strong></div>)}</div>
      </div>
      <div className="sectionCard"><div className="dashHead"><div><span className="eyebrow">ACTION QUEUE</span><h3>Executive priorities</h3></div></div>
        <div className="opsList">{data.actionQueue.length===0?<div className="emptyState">No active executive action queue.</div>:data.actionQueue.map(item=><div className="opsRow" key={item.departureId}><div><b>{item.departureCode}</b><span>{item.driver ?? 'Operational control'}</span><small>{item.focus ?? 'Review control state'}</small></div><strong className={item.riskScore>=80?'risk':item.riskScore>=50?'watch':'ready'}>{item.priority}<i>{item.riskScore}</i></strong></div>)}</div>
      </div>
    </section>
  </main>
}
function Metric({label,value,icon:Icon}:{label:string,value:number|string,icon:typeof Plane}){return <div className="opsMetric"><Icon size={16}/><span>{label}</span><b>{value}</b></div>}

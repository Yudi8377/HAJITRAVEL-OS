import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { Activity, ArrowUpRight, CircleDollarSign, FileCheck2, Plane, ShieldCheck, Users, AlertTriangle, Clock3, TriangleAlert, Hotel, BusFront, Network, ShieldAlert } from 'lucide-react'
import { HaajiLogo } from '../../src/components/HaajiLogo'
import { getDashboardSnapshot } from '../../src/data/dashboard'
import { resolveAccessContext } from '../../src/access/runtime'

const modules = [
  ['Jamaah','Profiles, documents & consent','/jamaah',Users],
  ['Packages','Products & departure plans','/packages-admin',Plane],
  ['Finance','Invoices & reconciliation','/finance',CircleDollarSign],
  ['Compliance','Requirements & evidence','/compliance',FileCheck2],
  ['Operations','Groups, flights & service','/operations',Activity],
  ['Journey Control','Flights, hotels & transport','/operations-admin',Hotel],
  ['Readiness','Documents, visa & handoff','/readiness-admin',FileCheck2],
  ['Journey','Pilgrim timeline & milestones','/journey-admin',Activity],
  ['Digital ID','Pilgrim identity & QR credential','/digital-id-admin',ShieldCheck],
  ['Safety','Incident & guardian control','/safety-admin',ShieldAlert],
  ['Risk Center','Exceptions, SLA & evidence','/risk',TriangleAlert],
  ['Audit','Traceability & events','/audit',ShieldCheck],
  ['Enterprise Control','Cross-domain operating plane','/control-center',Network],
] as const

export default async function Admin() {
  const access = await resolveAccessContext()
  if (!access.authenticated) redirect('/login?next=/admin')
  if (!access.organizationId || !access.capabilities.includes('reports.read')) {
    return <AccessDenied role={access.role} />
  }
  const data = await getDashboardSnapshot()
  const money = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0})
  const exposure = data.attention.documents + data.attention.incidents
  const exceptionCount = data.attention.departures + data.attention.incidents
  return (
    <div className="adminShell">
      <aside className="adminSide">
        <HaajiLogo light />
        <div className="orgBadge"><small>ACTIVE ORGANIZATION</small><b>{data.organizationName}</b><span>Staging · Controlled</span></div>
        <nav>{modules.map(([name,,href,Icon]) => <Link href={href} key={name}><Icon size={17}/><span>{name}</span></Link>)}</nav>
        <div className="sideBottom"><ShieldCheck size={15}/> Security-first workspace</div>
      </aside>
      <main className="adminMain">
        <header className="adminHeader">
          <div><span className="eyebrow">ADMIN CONTROL CENTER</span><h1>Operational dashboard</h1></div>
          <div className="adminActions"><span className="liveDot"/> STAGING <Link href="/" className="publicButton">View website</Link></div>
        </header>
        <div className="adminPage">
          <section className="adminHero">
            <div className="adminHeroPhoto" aria-hidden="true"/>
            <div className="adminHeroShade" aria-hidden="true"/>
            <div className="adminHeroContent">
              <span className="eyebrow">HAJITRAVEL OS · EXECUTIVE CONTROL</span>
              <h2>Menjalankan perjalanan suci dengan <em>kendali penuh.</em></h2>
              <p>Satu control room untuk jamaah, paket, keberangkatan, keuangan, compliance, operasi, dan audit — dengan data organisasi yang terkontrol.</p>
              <div className="adminHeroMeta"><span><ShieldCheck size={15}/> Security-first</span><span><Plane size={15}/> Departure intelligence</span><span><Activity size={15}/> Live operational view</span></div>
            </div>
            <div className="adminHeroStamp"><small>CONTROLLED WORKSPACE</small><b>HAJITRAVEL<br/>OPERATING SYSTEM</b><span>STAGING · PRIVATE</span></div>
          </section>
          <div className="welcome">
            <div><span className="eyebrow">CONTROL ROOM</span><h2>Selamat datang di <em>control room.</em></h2><p>Ringkasan operasional berbasis data organisasi yang sedang aktif.</p></div>
            <Link href="/jamaah/new" className="primaryCta">+ Tambah Jamaah</Link>
          </div>
          <div className="kpiGrid">
            <Kpi label="Jamaah" value={String(data.jamaahCount)} note="Organization-scoped" />
            <Kpi label="Departures" value={String(data.departureCount)} note="Upcoming control" />
            <Kpi label="Readiness" value={data.readiness == null ? '—' : data.readiness + '%'} note="Required checklist" />
            <Kpi label="Outstanding" value={money.format(data.outstanding)} note="Unpaid exposure" />
            <Kpi label="Compliance exposure" value={String(exposure)} note="Reviews + incidents" />
            <Kpi label="Exceptions" value={String(exceptionCount)} note="Operational attention" />
          </div>
          <section className="towerStrip">
            <div><span className="eyebrow">EXECUTIVE CONTROL TOWER</span><b>Departure readiness at a glance</b><small>Prioritaskan keberangkatan yang membutuhkan tindakan sebelum handoff operasional.</small></div>
            <div className="towerLegend"><span><i className="towerDot ready"/> READY</span><span><i className="towerDot watch"/> WATCH</span><span><i className="towerDot risk"/> ACTION</span></div>
          </section>
          <section className="executiveBar">
            <div><span className="eyebrow">PORTFOLIO CONTROL</span><b>{data.executiveState ?? data.portfolioState ?? 'CONTROLLED'}</b><small>{data.portfolioHealth == null ? 'Belum ada portfolio score.' : `Portfolio health ${data.portfolioHealth}%`}</small></div>
            <Metric label="P1 Critical" value={data.executive.critical} icon={TriangleAlert}/>
            <Metric label="P2 High" value={data.executive.high} icon={AlertTriangle}/>
            <Metric label="SLA Overdue" value={data.executive.overdue} icon={Clock3}/>
            <Metric label="Due < 4h" value={data.executive.due4h} icon={Clock3}/>
            <Metric label="Data quality" value={data.executive.dataQuality} icon={ShieldCheck}/>
          </section>
          <div className="dashboardGrid">
            <section className="dashCard large">
              <div className="dashHead"><div><span className="eyebrow">DEPARTURES</span><h3>Upcoming departures</h3></div><Link href="/operations">View all <ArrowUpRight size={15}/></Link></div>
              {data.upcoming.length === 0 ? <Empty label="Belum ada keberangkatan mendatang." /> : <div className="departureList">{data.upcoming.map(item => <div className="departure" key={item.id}><div className="depInfo"><b>{item.code}</b><span>{item.groupCode ?? 'No group'} · {item.jamaahCount} Jamaah · {item.departureDate}</span></div><div className="depControl"><span className={`readinessPill ${item.readiness == null ? 'unknown' : item.readiness >= 80 ? 'ready' : item.readiness >= 60 ? 'watch' : 'risk'}`}>{item.readiness == null ? 'NO DATA' : item.readiness + '% READY'}</span><span className="depStatus">{item.status}</span></div></div>)}</div>}
            </section>
            <section className="dashCard">
              <div className="dashHead"><div><span className="eyebrow">ATTENTION</span><h3>Needs action</h3></div><AlertTriangle size={17}/></div>
              <div className="attention"><Action title={data.attention.documents + ' reviews'} sub="Open / gap / review required"/><Action title={data.attention.invoices + ' invoices'} sub="Issued / partial / overdue"/><Action title={data.attention.departures + ' departures'} sub="Readiness below 80%"/><Action title={data.attention.incidents + ' incidents'} sub="Open operational cases"/></div>
            </section>
            <section className="dashCard">
              <div className="dashHead"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Audit stream</h3></div><Link href="/audit">Open <ArrowUpRight size={15}/></Link></div>
              {data.audit.length === 0 ? <Empty label="Belum ada audit event." /> : <div className="activity">{data.audit.map(event => <p key={event.id}><b>{event.action}</b> <span>{event.entity || 'system'}</span></p>)}</div>}
            </section>
            <section className="dashCard actionQueueCard">
              <div className="dashHead"><div><span className="eyebrow">EXECUTIVE ACTION QUEUE</span><h3>Prioritas tindakan</h3></div><Link href="/operations">Open <ArrowUpRight size={15}/></Link></div>
              {data.actionQueue.length === 0 ? <Empty label="Belum ada action queue aktif." /> : <div className="actionQueue">{data.actionQueue.map(item => <div className="queueItem" key={item.departureId}><div><b>{item.departureCode}</b><span>{item.departureDate} · {item.driver ?? 'Operational control'}</span><small>{item.focus ?? 'Review departure control state'}</small></div><strong className={item.riskScore >= 80 ? 'risk' : item.riskScore >= 50 ? 'watch' : 'ready'}>{item.priority}<i>{item.riskScore}</i></strong></div>)}</div>}
            </section>
            <section className="dashCard moduleCard">
              <div className="dashHead"><div><span className="eyebrow">WORKSPACES</span><h3>Go to module</h3></div></div>
              <div className="moduleTiles">{modules.map(([name,desc,href,Icon]) => <Link href={href} key={name}><Icon size={18}/><div><b>{name}</b><span>{desc}</span></div><ArrowUpRight size={14}/></Link>)}</div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
function Kpi({label,value,note}:{label:string,value:string,note:string}) { return <div className="kpi"><span>{label}</span><b>{value}</b><small>{note}</small></div> }
function Metric({label,value,icon:Icon}:{label:string,value:number,icon:typeof ShieldCheck}) { return <div className="towerMetric"><Icon size={15}/><span>{label}</span><b>{value}</b></div> }
function Action({title,sub}:{title:string,sub:string}) { return <div className="action"><span><b>{title}</b><small>{sub}</small></span><ArrowUpRight size={14}/></div> }
function Empty({label}:{label:string}) { return <div className="emptyState">{label}</div> }
function AccessDenied({role}:{role:string|null}) {
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:32}}><section className="dashCard" style={{maxWidth:620,width:'100%'}}><span className="eyebrow">ACCESS CONTROL</span><h1>Akses control center tidak tersedia</h1><p>Akun ini belum memiliki organization scope aktif atau capability <b>reports.read</b>.</p><p>Role saat ini: <b>{role ?? '—'}</b></p><Link href="/login?next=/admin" className="primaryCta">Kembali ke login</Link></section></main>
}

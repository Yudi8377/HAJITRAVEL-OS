import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
import { Activity, ArrowUpRight, CircleDollarSign, FileCheck2, Plane, ShieldCheck, Users, AlertTriangle } from 'lucide-react'
import { HaajiLogo } from '../../src/components/HaajiLogo'
import { getDashboardSnapshot } from '../../src/data/dashboard'
import { resolveAccessContext } from '../../src/access/runtime'

const modules = [
  ['Jamaah','Profiles, documents & consent','/jamaah',Users],
  ['Packages','Products & departure plans','/packages',Plane],
  ['Finance','Invoices & reconciliation','/finance',CircleDollarSign],
  ['Compliance','Requirements & evidence','/compliance',FileCheck2],
  ['Operations','Groups, flights & service','/operations',Activity],
  ['Audit','Traceability & events','/audit',ShieldCheck],
] as const

export default async function Admin() {
  const access = await resolveAccessContext()
  if (!access.authenticated) redirect('/login?next=/admin')
  if (!access.organizationId || !access.capabilities.includes('reports.read')) {
    return <AccessDenied role={access.role} />
  }
  const data = await getDashboardSnapshot()
  const money = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0})
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
            <Kpi label="Jamaah terdaftar" value={String(data.jamaahCount)} note="RLS organization-scoped" />
            <Kpi label="Keberangkatan" value={String(data.departureCount)} note="Mendatang" />
            <Kpi label="Outstanding" value={money.format(data.outstanding)} note="Invoice belum lunas" />
            <Kpi label="Readiness" value={data.readiness == null ? '—' : data.readiness + '%'} note="Checklist wajib" />
          </div>
          <div className="dashboardGrid">
            <section className="dashCard large">
              <div className="dashHead"><div><span className="eyebrow">DEPARTURES</span><h3>Upcoming departures</h3></div><Link href="/operations">View all <ArrowUpRight size={15}/></Link></div>
              {data.upcoming.length === 0 ? <Empty label="Belum ada keberangkatan mendatang." /> : <div className="departureList">{data.upcoming.map(item => <div className="departure" key={item.id}><div className="depInfo"><b>{item.code}</b><span>{item.groupCode ?? 'No group'} · {item.jamaahCount} Jamaah</span></div><span className="depStatus">{item.status}</span></div>)}</div>}
            </section>
            <section className="dashCard">
              <div className="dashHead"><div><span className="eyebrow">ATTENTION</span><h3>Needs action</h3></div><AlertTriangle size={17}/></div>
              <div className="attention"><Action title={data.attention.documents + ' reviews'} sub="Open / gap / review required"/><Action title={data.attention.invoices + ' invoices'} sub="Issued / partial / overdue"/><Action title={data.attention.departures + ' departures'} sub="Readiness below 80%"/><Action title={data.attention.incidents + ' incidents'} sub="Open operational cases"/></div>
            </section>
            <section className="dashCard">
              <div className="dashHead"><div><span className="eyebrow">RECENT ACTIVITY</span><h3>Audit stream</h3></div><Link href="/audit">Open <ArrowUpRight size={15}/></Link></div>
              {data.audit.length === 0 ? <Empty label="Belum ada audit event." /> : <div className="activity">{data.audit.map(event => <p key={event.id}><b>{event.action}</b> <span>{event.entity || 'system'}</span></p>)}</div>}
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
function Action({title,sub}:{title:string,sub:string}) { return <div className="action"><span><b>{title}</b><small>{sub}</small></span><ArrowUpRight size={14}/></div> }
function Empty({label}:{label:string}) { return <div className="emptyState">{label}</div> }
function AccessDenied({role}:{role:string|null}) {
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:32}}><section className="dashCard" style={{maxWidth:620,width:'100%'}}><span className="eyebrow">ACCESS CONTROL</span><h1>Akses control center tidak tersedia</h1><p>Akun ini belum memiliki organization scope aktif atau capability <b>reports.read</b>.</p><p>Role saat ini: <b>{role ?? '—'}</b></p><Link href="/login?next=/admin" className="primaryCta">Kembali ke login</Link></section></main>
}

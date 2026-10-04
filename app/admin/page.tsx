import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, ArrowUpRight, BrainCircuit, Building2, CircleDollarSign, FileCheck2, Landmark, Network, Plane, ShieldAlert, ShieldCheck, Users, WalletCards } from 'lucide-react'
import { HaajiLogo } from '../../src/components/HaajiLogo'
import { getDashboardSnapshot } from '../../src/data/dashboard'
import { resolveAccessContext } from '../../src/access/runtime'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const groups = [
  { title:'Executive', items:[['Command Center','Executive overview','/control-center',Activity],['Executive Briefing','AI-assisted management brief','/control-center',BrainCircuit],['KPI & BI','Performance intelligence','/control-center',Network]] },
  { title:'Sales & CRM', items:[['Customer 360','Customers, leads & relationships','/jamaah',Users],['Sales Pipeline','Leads, opportunities & conversion','/jamaah',Activity],['Marketing','Campaigns & acquisition','/inquire',ArrowUpRight]] },
  { title:'Hajj & Umrah', items:[['Jamaah','Profiles, documents & consent','/jamaah',Users],['Packages','Products & departure plans','/packages-admin',Plane],['Registration','Registration lifecycle','/registrations-admin',FileCheck2],['Booking & Payment','Commercial transactions','/finance',CircleDollarSign],['Departure','Groups & operational control','/operations',Plane],['Flight / Hotel / Transport','Service fulfillment','/operations-admin',Landmark],['Readiness & Visa','Documents & readiness graph','/readiness-admin',FileCheck2],['Journey','Pilgrim milestones','/journey-admin',Activity],['Digital ID','QR identity credential','/digital-id-admin',ShieldCheck],['Safety & Guardian','Incidents & emergency control','/safety-admin',ShieldAlert]] },
  { title:'Finance & Tax', items:[['Accounting','GL, journals & financial close','/finance',CircleDollarSign],['AR / AP','Receivables & payables','/finance',WalletCards],['Cash & Bank','Cash position & reconciliation','/finance',Landmark],['Budget & Cost Center','Budget vs actual','/finance',CircleDollarSign],['Tax Management','Tax obligations & evidence','/finance',FileCheck2],['Fixed Assets','Assets & depreciation','/finance',Building2]] },
  { title:'Human Capital', items:[['Employees','Employee master & lifecycle','/control-center',Users],['Organization','Structure, positions & authority','/control-center',Building2],['Recruitment','Hiring & onboarding','/control-center',Users],['Attendance & Leave','Workforce attendance','/control-center',Activity],['Performance','Goals & appraisal','/control-center',Activity],['Payroll','Salary, allowance & payroll approval','/finance',CircleDollarSign]] },
  { title:'General Affairs', items:[['Assets & Facilities','Office, equipment & vehicles','/control-center',Building2],['Inventory','Supplies & stock control','/control-center',Landmark],['Maintenance','Service schedules & work orders','/control-center',Activity],['Company Documents','Licenses, permits & records','/audit',FileCheck2]] },
  { title:'Procurement & Supplier', items:[['Procurement','Requests, RFQ & PO','/control-center',Landmark],['Suppliers','Vendor master & performance','/control-center',Building2],['Contracts','Commercial terms & SLA','/audit',FileCheck2]] },
  { title:'Legal, GRC & Security', items:[['Legal & Contracts','Corporate legal control','/audit',FileCheck2],['Risk Center','Risk, exceptions & SLA','/risk',ShieldAlert],['Compliance','Controls & evidence','/compliance',ShieldCheck],['Audit','Immutable traceability','/audit',ShieldCheck],['Security & Access','RBAC, capabilities & scope','/control-center',ShieldCheck]] },
  { title:'AI & Integration', items:[['AI Command','Governed enterprise agents','/control-center',BrainCircuit],['Integrations','Controlled endpoints','/control-center',Network],['Workflow & Approvals','Maker-checker-approver flows','/control-center',Activity]] },
] as const

const modules = groups.flatMap(g=>g.items)

export default async function Admin() {
  const access = await resolveAccessContext()
  if (!access.authenticated) redirect('/login?next=/admin')
  if (!access.organizationId || !access.capabilities.includes('reports.read')) return <AccessDenied role={access.role} />
  const data = await getDashboardSnapshot()
  const money = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0})
  const exposure = data.attention.documents + data.attention.incidents
  const exceptionCount = data.attention.departures + data.attention.incidents

  return <div className="adminShell">
    <aside className="adminSide">
      <HaajiLogo light />
      <div className="orgBadge"><small>ACTIVE ORGANIZATION</small><b>{data.organizationName}</b><span>ENTERPRISE · CONTROLLED</span></div>
      <nav>
        <Link href="/admin" className="active"><Activity size={17}/><span>Enterprise Home</span></Link>
        {groups.map(group=><div key={group.title} className="navGroup"><small>{group.title}</small>{group.items.map(([name,,href,Icon])=><Link href={href} key={name}><Icon size={15}/><span>{name}</span></Link>)}</div>)}
      </nav>
      <div className="sideBottom"><ShieldCheck size={15}/> Security-first enterprise workspace</div>
    </aside>

    <main className="adminMain">
      <header className="adminHeader">
        <div><span className="eyebrow">HAJITRAVEL OS · ENTERPRISE MANAGEMENT</span><h1>Enterprise Command Center</h1></div>
        <div className="adminActions"><span className="liveDot"/> CONTROLLED <Link href="/" className="publicButton">View website</Link></div>
      </header>

      <div className="adminPage">
        <section className="adminHero">
          <div className="adminHeroPhoto" aria-hidden="true"/><div className="adminHeroShade" aria-hidden="true"/>
          <div className="adminHeroContent">
            <span className="eyebrow">ONE COMPANY · ONE OPERATING SYSTEM</span>
            <h2>Seluruh perusahaan dalam <em>satu control room.</em></h2>
            <p>ERP, CRM, Accounting, Tax, HRD, Payroll, GA, Procurement, Hajj & Umrah Operations, GRC, AI dan Executive Management terhubung dalam satu enterprise control plane.</p>
            <div className="adminHeroMeta"><span><ShieldCheck size={15}/> Organization scoped</span><span><Activity size={15}/> Live operational control</span><span><BrainCircuit size={15}/> Governed AI</span></div>
          </div>
          <div className="adminHeroStamp"><small>ENTERPRISE MANAGEMENT</small><b>HAJITRAVEL<br/>OPERATING SYSTEM</b><span>CONTROLLED WORKSPACE</span></div>
        </section>

        <div className="welcome"><div><span className="eyebrow">EXECUTIVE PULSE</span><h2>Selamat datang di <em>pusat kendali perusahaan.</em></h2><p>Mulai dari kesehatan perusahaan hingga detail transaksi dapat ditelusuri sampai evidence dan audit trail.</p></div><Link href="/control-center" className="primaryCta">Open Control Tower <ArrowUpRight size={15}/></Link></div>

        <div className="kpiGrid">
          <Kpi label="Jamaah / Customer" value={String(data.jamaahCount)} note="Customer 360" />
          <Kpi label="Departures" value={String(data.departureCount)} note="Travel operations" />
          <Kpi label="Readiness" value={data.readiness == null ? '—' : data.readiness + '%'} note="Operational readiness" />
          <Kpi label="Outstanding" value={money.format(data.outstanding)} note="AR exposure" />
          <Kpi label="Compliance exposure" value={String(exposure)} note="Documents + incidents" />
          <Kpi label="Exceptions" value={String(exceptionCount)} note="Needs management action" />
        </div>

        <section className="towerStrip"><div><span className="eyebrow">ENTERPRISE CONTROL TOWER</span><b>Company health at a glance</b><small>Gunakan Control Tower untuk melihat exception, SLA, finance, people, procurement, compliance dan travel operations.</small></div><div className="towerLegend"><span><i className="towerDot ready"/> CONTROLLED</span><span><i className="towerDot watch"/> WATCH</span><span><i className="towerDot risk"/> ACTION</span></div></section>

        <section className="dashboardGrid">
          <section className="dashCard large"><div className="dashHead"><div><span className="eyebrow">TRAVEL OPERATIONS</span><h3>Upcoming departures</h3></div><Link href="/operations">View all <ArrowUpRight size={15}/></Link></div>{data.upcoming.length===0?<Empty label="Belum ada keberangkatan mendatang."/>:<div className="departureList">{data.upcoming.map(item=><div className="departure" key={item.id}><div className="depInfo"><b>{item.code}</b><span>{item.groupCode??'No group'} · {item.jamaahCount} Jamaah · {item.departureDate}</span></div><div className="depControl"><span className={`readinessPill ${item.readiness==null?'unknown':item.readiness>=80?'ready':item.readiness>=60?'watch':'risk'}`}>{item.readiness==null?'NO DATA':item.readiness+'% READY'}</span><span className="depStatus">{item.status}</span></div></div>)}</div>}</section>
          <section className="dashCard"><div className="dashHead"><div><span className="eyebrow">MANAGEMENT ACTION</span><h3>Needs attention</h3></div><ShieldAlert size={17}/></div><div className="attention"><Action title={data.attention.documents+' document reviews'} sub="Readiness / compliance"/><Action title={data.attention.invoices+' invoices'} sub="Issued / partial / overdue"/><Action title={data.attention.departures+' departures'} sub="Readiness below threshold"/><Action title={data.attention.incidents+' incidents'} sub="Open operational cases"/></div></section>
          <section className="dashCard actionQueueCard"><div className="dashHead"><div><span className="eyebrow">ENTERPRISE WORKSPACES</span><h3>All management domains</h3></div><Link href="/control-center">Control Tower <ArrowUpRight size={15}/></Link></div><div className="moduleTiles">{groups.map(group=><div key={group.title} className="moduleGroup"><small>{group.title}</small>{group.items.slice(0,4).map(([name,desc,href,Icon])=><Link href={href} key={name}><Icon size={17}/><div><b>{name}</b><span>{desc}</span></div><ArrowUpRight size={13}/></Link>)}</div>)}</div></section>
        </section>

        <section className="dashCard" style={{marginTop:14}}><div className="dashHead"><div><span className="eyebrow">MANAGEMENT MODEL</span><h3>One OS, connected domains</h3></div></div><div className="moduleTiles"><Governance title="ERP" text="Finance, procurement, assets, budget and accounting share one enterprise control plane." icon={CircleDollarSign}/><Governance title="People" text="HRD, organization, attendance, performance and payroll connect to accounting and tax." icon={Users}/><Governance title="Travel" text="CRM, jamaah, booking, departure, visa, journey, digital ID and safety remain the specialist core." icon={Plane}/><Governance title="Governance" text="Legal, GRC, SoD, audit, evidence and AI policy gates protect critical actions." icon={ShieldCheck}/></div></section>
      </div>
    </main>
  </div>
}

function Kpi({label,value,note}:{label:string,value:string,note:string}){return <div className="kpi"><span>{label}</span><b>{value}</b><small>{note}</small></div>}
function Action({title,sub}:{title:string,sub:string}){return <div className="action"><span><b>{title}</b><small>{sub}</small></span><ArrowUpRight size={14}/></div>}
function Governance({title,text,icon:Icon}:{title:string,text:string,icon:any}){return <div><Icon size={18}/><div><b>{title}</b><span>{text}</span></div></div>}
function Empty({label}:{label:string}){return <div className="emptyState">{label}</div>}
function AccessDenied({role}:{role:string|null}){return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:32}}><section className="dashCard" style={{maxWidth:620,width:'100%'}}><span className="eyebrow">ACCESS CONTROL</span><h1>Akses control center tidak tersedia</h1><p>Akun ini belum memiliki organization scope aktif atau capability <b>reports.read</b>.</p><p>Role saat ini: <b>{role??'—'}</b></p><Link href="/login?next=/admin" className="primaryCta">Kembali ke login</Link></section></main>}

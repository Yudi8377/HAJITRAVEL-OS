import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, CheckCircle2, ChevronRight, PackageCheck, Plus, ShieldCheck } from 'lucide-react'
import { resolveAccessContext } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'
import { createPackage, updatePackage, createDeparture, updateDeparture, createItinerary, updateItinerary } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PackageControl() {
  const access = await resolveAccessContext()
  if (!access.authenticated) redirect('/login?next=/packages-admin')
  if (!access.organizationId || !access.capabilities.includes('package.read')) {
    return <main className="modulePage"><section className="dashCard"><span className="eyebrow">ACCESS CONTROL</span><h1>Package control tidak tersedia</h1><p>Akun ini belum memiliki capability <b>package.read</b>.</p></section></main>
  }

  const sb = await createServerSupabaseClient()
  const [{ data: packages }, { data: departures }, { data: itineraries }] = await Promise.all([
    sb.schema('operations').from('packages').select('id,package_code,package_type,name,version_no,price,currency,status,effective_from,effective_to,terms').eq('organization_id', access.organizationId).order('package_type').order('name'),
    sb.schema('operations').from('departures').select('id,package_id,departure_code,departure_date,return_date,capacity,status,notes').eq('organization_id', access.organizationId).order('departure_date'),
    sb.from('travel_itineraries').select('id,package_id,day_no,title,description,location,sort_order,is_published').eq('organization_id', access.organizationId).order('package_id').order('sort_order').order('day_no'),
  ])

  const packageRows = packages ?? []
  const departureRows = departures ?? []
  const itineraryRows = itineraries ?? []
  const money = new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0})

  return <div className="adminShell">
    <aside className="adminSide"><ShieldCheck size={28}/><div className="orgBadge"><small>PACKAGE CONTROL</small><b>HAJITRAVEL OS</b><span>{access.role ?? 'USER'} · {access.organizationId.slice(0,8)}</span></div><nav><Link href="/admin">← Control Center</Link><Link href="/packages"><PackageCheck size={17}/><span>Public Catalog</span></Link></nav><div className="sideBottom"><ShieldCheck size={15}/> Organization-scoped</div></aside>
    <main className="adminMain"><header className="adminHeader"><div><span className="eyebrow">PHASE 17 · PRODUCT CONTROL</span><h1>Packages & Departures</h1></div><div className="adminActions"><span className="liveDot"/> CONTROLLED <Link href="/packages" className="publicButton">Public catalog</Link></div></header>
      <div className="adminPage">
        <section className="moduleHero"><div><span className="eyebrow">MASTER DATA</span><h2>Produk perjalanan yang <em>benar-benar hidup.</em></h2><p>Draft → Published → Departure. Semua perubahan melewati organization scope, capability, dan RLS sebelum masuk ke website publik.</p></div><div className="moduleHeroStamp"><small>PHASE 17</small><b>PRODUCT<br/>CONTROL</b></div></section>
        <section className="packageStats"><div><span>PACKAGES</span><b>{packageRows.length}</b></div><div><span>PUBLISHED</span><b>{packageRows.filter(x=>x.status==='PUBLISHED').length}</b></div><div><span>DEPARTURES</span><b>{departureRows.length}</b></div><div><span>READY</span><b>{departureRows.filter(x=>x.status==='READY').length}</b></div></section>
        <div className="packageGrid">
          <section className="dashCard"><div className="dashHead"><div><span className="eyebrow">CREATE</span><h3>New package</h3></div><Plus size={18}/></div>
            <form action={createPackage} className="packageForm">
              <label>Package code<input name="package_code" placeholder="UMR-PREM-2027" required/></label>
              <label>Type<select name="package_type" defaultValue="UMRAH"><option value="UMRAH">UMRAH</option><option value="HAJI_KHUSUS">HAJI KHUSUS</option></select></label>
              <label>Name<input name="name" placeholder="Umrah Premium 2027" required/></label>
              <div className="formTwo"><label>Price<input name="price" type="number" min="0" defaultValue="0"/></label><label>Currency<input name="currency" defaultValue="IDR" maxLength={3}/></label></div>
              <div className="formTwo"><label>Effective from<input name="effective_from" type="date"/></label><label>Effective to<input name="effective_to" type="date"/></label></div>
              <label>Terms<textarea name="terms" rows={3} placeholder="Ketentuan komersial/internal"/></label>
              <button className="primaryCta" type="submit">Create draft <ChevronRight size={15}/></button>
            </form>
          </section>
          <section className="dashCard"><div className="dashHead"><div><span className="eyebrow">DEPARTURE</span><h3>New departure</h3></div><CalendarDays size={18}/></div>
            <form action={createDeparture} className="packageForm">
              <label>Package<select name="package_id" required><option value="">Pilih package</option>{packageRows.map(p=><option key={p.id} value={p.id}>{p.package_code} · {p.name}</option>)}</select></label>
              <label>Departure code<input name="departure_code" placeholder="UMR-2701-JKT" required/></label>
              <div className="formTwo"><label>Departure<input name="departure_date" type="date" required/></label><label>Return<input name="return_date" type="date"/></label></div>
              <label>Capacity<input name="capacity" type="number" min="1" placeholder="45"/></label>
              <label>Notes<textarea name="notes" rows={3} placeholder="Catatan operational"/></label>
              <button className="primaryCta" type="submit">Create planned departure <ChevronRight size={15}/></button>
            </form>
          </section>
        </div>
        <section className="dashCard"><div className="dashHead"><div><span className="eyebrow">PRODUCT REGISTER</span><h3>Packages</h3></div><span className="catalogMeta">{packageRows.length} records</span></div>
          <div className="packageList">{packageRows.length===0?<div className="emptyState">Belum ada package. Buat draft pertama di panel atas.</div>:packageRows.map(p=><form action={updatePackage} className="packageRecord" key={p.id}>
            <input type="hidden" name="id" value={p.id}/><div className="packageRecordTop"><div><b>{p.package_code}</b><span>{p.package_type} · v{p.version_no}</span></div><strong className={'statusBadge '+String(p.status).toLowerCase()}>{p.status}</strong></div>
            <div className="formTwo"><label>Name<input name="name" defaultValue={p.name}/></label><label>Price<input name="price" type="number" min="0" defaultValue={Number(p.price||0)}/></label></div>
            <div className="formTwo"><label>From<input name="effective_from" type="date" defaultValue={p.effective_from ?? ''}/></label><label>To<input name="effective_to" type="date" defaultValue={p.effective_to ?? ''}/></label></div>
            <div className="formTwo"><label>Type<select name="package_type" defaultValue={p.package_type}><option value="UMRAH">UMRAH</option><option value="HAJI_KHUSUS">HAJI KHUSUS</option></select></label><label>Status<select name="status" defaultValue={p.status}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></label></div>
            <label>Terms<textarea name="terms" rows={2} defaultValue={p.terms ?? ''}/></label><input type="hidden" name="currency" value={p.currency?.trim() || 'IDR'}/><input type="hidden" name="version_no" value={p.version_no}/><button type="submit" className="secondaryCta">Save package</button>
          </form>)}</div>
        </section>
        <section className="dashCard"><div className="dashHead"><div><span className="eyebrow">ITINERARY REGISTER</span><h3>Published journey content</h3></div><span className="catalogMeta">{itineraryRows.length} records</span></div>
          <div className="packageGrid">
            <form action={createItinerary} className="packageForm">
              <label>Package<select name="package_id" required><option value="">Pilih package</option>{packageRows.map(p=><option key={p.id} value={p.id}>{p.package_code} · {p.name}</option>)}</select></label>
              <div className="formTwo"><label>Day<input name="day_no" type="number" min="1" defaultValue="1"/></label><label>Sort order<input name="sort_order" type="number" min="0" defaultValue="0"/></label></div>
              <label>Title<input name="title" placeholder="Arrival & hotel check-in" required/></label>
              <label>Location<input name="location" placeholder="Makkah"/></label>
              <label>Description<textarea name="description" rows={3}/></label>
              <label className="checkLine"><input name="is_published" type="checkbox"/> Publish to public catalog</label>
              <button type="submit" className="primaryCta">Add itinerary <ChevronRight size={15}/></button>
            </form>
            <div className="packageList">{itineraryRows.length===0?<div className="emptyState">Belum ada itinerary.</div>:itineraryRows.map(i=><form action={updateItinerary} className="packageRecord" key={i.id}><input type="hidden" name="id" value={i.id}/><div className="packageRecordTop"><div><b>DAY {String(i.day_no).padStart(2,'0')} · {packageRows.find(p=>p.id===i.package_id)?.package_code ?? 'PACKAGE'}</b><span>{i.is_published?'Published':'Draft content'}</span></div><strong className={'statusBadge '+(i.is_published?'published':'draft')}>{i.is_published?'PUBLIC':'DRAFT'}</strong></div><div className="formTwo"><label>Day<input name="day_no" type="number" min="1" defaultValue={i.day_no}/></label><label>Sort<input name="sort_order" type="number" min="0" defaultValue={i.sort_order}/></label></div><label>Title<input name="title" defaultValue={i.title}/></label><label>Location<input name="location" defaultValue={i.location ?? ''}/></label><label>Description<textarea name="description" rows={3} defaultValue={i.description ?? ''}/></label><label className="checkLine"><input name="is_published" type="checkbox" defaultChecked={i.is_published}/> Publish to public catalog</label><button type="submit" className="secondaryCta">Save itinerary</button></form>)}</div>
          </div>
        </section>
        <section className="dashCard"><div className="dashHead"><div><span className="eyebrow">DEPARTURE REGISTER</span><h3>Operational departures</h3></div><span className="catalogMeta">{departureRows.length} records</span></div>
          <div className="packageList">{departureRows.length===0?<div className="emptyState">Belum ada departure. Buat planned departure di panel atas.</div>:departureRows.map(d=>{const p=packageRows.find(x=>x.id===d.package_id);return <form action={updateDeparture} className="packageRecord" key={d.id}><input type="hidden" name="id" value={d.id}/><div className="packageRecordTop"><div><b>{d.departure_code}</b><span>{p?.package_code ?? 'Unknown package'} · {d.capacity ?? '—'} pax</span></div><strong className={'statusBadge '+String(d.status).toLowerCase()}>{d.status}</strong></div><div className="formTwo"><label>Departure<input name="departure_date" type="date" defaultValue={d.departure_date}/></label><label>Return<input name="return_date" type="date" defaultValue={d.return_date ?? ''}/></label></div><div className="formTwo"><label>Capacity<input name="capacity" type="number" min="1" defaultValue={d.capacity ?? ''}/></label><label>Status<select name="status" defaultValue={d.status}><option>PLANNED</option><option>READY</option><option>CANCELLED</option><option>CLOSED</option></select></label></div><label>Notes<textarea name="notes" rows={2} defaultValue={d.notes ?? ''}/></label><button type="submit" className="secondaryCta">Save departure</button></form>})}</div>
        </section>
      </div>
    </main>
  </div>
}

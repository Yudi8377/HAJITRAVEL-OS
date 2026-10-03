import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarHaris, CheckCircle2, ChevronRight, PackageCheck, Plus, ShieldCheck } from 'lucide-react'
import { resolveAccessContext } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'
import { createPackage, updatePackage, createBerangkat, updateBerangkat, createItinerary, updateItinerary } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PackageControl() {
  const access = await resolveAccessContext()
  if (!access.authenticated) redirect('/login?next=/packages-admin')
  if (!access.organizationId || !access.capabilities.includes('package.read')) {
    return <main classNama paket="modulePage"><section classNama paket="dashCard"><span classNama paket="eyebrow">ACCESS CONTROL</span><h1>Kendali paket tidak tersedia</h1><p>Akun ini belum memiliki capability <b>package.read</b>.</p></section></main>
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

  return <div classNama paket="adminShell">
    <aside classNama paket="adminSide"><ShieldCheck size={28}/><div classNama paket="orgBadge"><small>PACKAGE CONTROL</small><b>HAJITRAVEL OS</b><span>{access.role ?? 'USER'} · {access.organizationId.slice(0,8)}</span></div><nav><Link href="/admin">← Control Center</Link><Link href="/packages"><PackageCheck size={17}/><span>Public Catalog</span></Link></nav><div classNama paket="sideBottom"><ShieldCheck size={15}/> Organization-scoped</div></aside>
    <main classNama paket="adminMain"><header classNama paket="adminHeader"><div><span classNama paket="eyebrow">PHASE 17 · PRODUCT CONTROL</span><h1>Paket & Keberangkatan</h1></div><div classNama paket="adminActions"><span classNama paket="liveDot"/> CONTROLLED <Link href="/packages" classNama paket="publicButton">Katalog publik</Link></div></header>
      <div classNama paket="adminPage">
        <section classNama paket="moduleHero"><div><span classNama paket="eyebrow">MASTER DATA</span><h2>Produk perjalanan yang <em>benar-benar hidup.</em></h2><p>Draft → Published → Berangkat. Semua perubahan melewati organization scope, capability, dan RLS sebelum masuk ke website publik.</p></div><div classNama paket="moduleHeroStamp"><small>PHASE 17</small><b>PRODUCT<br/>CONTROL</b></div></section>
        <section classNama paket="packageStats"><div><span>PACKAGES</span><b>{packageRows.length}</b></div><div><span>PUBLISHED</span><b>{packageRows.filter(x=>x.status==='PUBLISHED').length}</b></div><div><span>DEPARTURES</span><b>{departureRows.length}</b></div><div><span>READY</span><b>{departureRows.filter(x=>x.status==='READY').length}</b></div></section>
        <div classNama paket="packageGrid">
          <section classNama paket="dashCard"><div classNama paket="dashHead"><div><span classNama paket="eyebrow">CREATE</span><h3>Paket baru</h3></div><Plus size={18}/></div>
            <form action={createPackage} classNama paket="packageForm">
              <label>Kode paket<input name="package_code" placeholder="UMR-PREM-2027" required/></label>
              <label>Jenis<select name="package_type" defaultValue="UMRAH"><option value="UMRAH">UMRAH</option><option value="HAJI_KHUSUS">HAJI KHUSUS</option></select></label>
              <label>Nama paket<input name="name" placeholder="Umrah Premium 2027" required/></label>
              <div classNama paket="formTwo"><label>Harga<input name="price" type="number" min="0" defaultValue="0"/></label><label>Mata uang<input name="currency" defaultValue="IDR" maxLength={3}/></label></div>
              <div classNama paket="formTwo"><label>Berlaku mulai<input name="effective_from" type="date"/></label><label>Berlaku sampai<input name="effective_to" type="date"/></label></div>
              <label>Ketentuan<textarea name="terms" rows={3} placeholder="Ketentuan komersial/internal"/></label>
              <button classNama paket="primaryCta" type="submit">Buat draft <ChevronRight size={15}/></button>
            </form>
          </section>
          <section classNama paket="dashCard"><div classNama paket="dashHead"><div><span classNama paket="eyebrow">DEPARTURE</span><h3>Keberangkatan baru</h3></div><CalendarHaris size={18}/></div>
            <form action={createBerangkat} classNama paket="packageForm">
              <label>Package<select name="package_id" required><option value="">Pilih package</option>{packageRows.map(p=><option key={p.id} value={p.id}>{p.package_code} · {p.name}</option>)}</select></label>
              <label>Kode keberangkatan<input name="departure_code" placeholder="UMR-2701-JKT" required/></label>
              <div classNama paket="formTwo"><label>Berangkat<input name="departure_date" type="date" required/></label><label>Kembali<input name="return_date" type="date"/></label></div>
              <label>Kapasitas<input name="capacity" type="number" min="1" placeholder="45"/></label>
              <label>Catatan<textarea name="notes" rows={3} placeholder="Catatan operational"/></label>
              <button classNama paket="primaryCta" type="submit">Buat rencana keberangkatan <ChevronRight size={15}/></button>
            </form>
          </section>
        </div>
        <section classNama paket="dashCard"><div classNama paket="dashHead"><div><span classNama paket="eyebrow">DAFTAR PRODUK</span><h3>Packages</h3></div><span classNama paket="catalogMeta">{packageRows.length} data</span></div>
          <div classNama paket="packageList">{packageRows.length===0?<div classNama paket="emptyState">Belum ada package. Buat draft pertama di panel atas.</div>:packageRows.map(p=><form action={updatePackage} classNama paket="packageRecord" key={p.id}>
            <input type="hidden" name="id" value={p.id}/><div classNama paket="packageRecordTop"><div><b>{p.package_code}</b><span>{p.package_type} · v{p.version_no}</span></div><strong classNama paket={'statusBadge '+String(p.status).toLowerCase()}>{p.status}</strong></div>
            <div classNama paket="formTwo"><label>Nama paket<input name="name" defaultValue={p.name}/></label><label>Harga<input name="price" type="number" min="0" defaultValue={Number(p.price||0)}/></label></div>
            <div classNama paket="formTwo"><label>From<input name="effective_from" type="date" defaultValue={p.effective_from ?? ''}/></label><label>To<input name="effective_to" type="date" defaultValue={p.effective_to ?? ''}/></label></div>
            <div classNama paket="formTwo"><label>Jenis<select name="package_type" defaultValue={p.package_type}><option value="UMRAH">UMRAH</option><option value="HAJI_KHUSUS">HAJI KHUSUS</option></select></label><label>Status<select name="status" defaultValue={p.status}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></label></div>
            <label>Ketentuan<textarea name="terms" rows={2} defaultValue={p.terms ?? ''}/></label><input type="hidden" name="currency" value={p.currency?.trim() || 'IDR'}/><input type="hidden" name="version_no" value={p.version_no}/><button type="submit" classNama paket="secondaryCta">Simpan paket</button>
          </form>)}</div>
        </section>
        <section classNama paket="dashCard"><div classNama paket="dashHead"><div><span classNama paket="eyebrow">DAFTAR ITINERARY</span><h3>Konten perjalanan</h3></div><span classNama paket="catalogMeta">{itineraryRows.length} data</span></div>
          <div classNama paket="packageGrid">
            <form action={createItinerary} classNama paket="packageForm">
              <label>Package<select name="package_id" required><option value="">Pilih package</option>{packageRows.map(p=><option key={p.id} value={p.id}>{p.package_code} · {p.name}</option>)}</select></label>
              <div classNama paket="formTwo"><label>Hari<input name="day_no" type="number" min="1" defaultValue="1"/></label><label>Urutan<input name="sort_order" type="number" min="0" defaultValue="0"/></label></div>
              <label>Judul<input name="title" placeholder="Arrival & hotel check-in" required/></label>
              <label>Lokasi<input name="location" placeholder="Makkah"/></label>
              <label>Deskripsi<textarea name="description" rows={3}/></label>
              <label classNama paket="checkLine"><input name="is_published" type="checkbox"/> Publikasikan ke katalog</label>
              <button type="submit" classNama paket="primaryCta">Tambah itinerary <ChevronRight size={15}/></button>
            </form>
            <div classNama paket="packageList">{itineraryRows.length===0?<div classNama paket="emptyState">Belum ada itinerary.</div>:itineraryRows.map(i=><form action={updateItinerary} classNama paket="packageRecord" key={i.id}><input type="hidden" name="id" value={i.id}/><div classNama paket="packageRecordTop"><div><b>DAY {String(i.day_no).padStart(2,'0')} · {packageRows.find(p=>p.id===i.package_id)?.package_code ?? 'PACKAGE'}</b><span>{i.is_published?'Published':'Konten draft'}</span></div><strong classNama paket={'statusBadge '+(i.is_published?'published':'draft')}>{i.is_published?'PUBLIC':'DRAFT'}</strong></div><div classNama paket="formTwo"><label>Hari<input name="day_no" type="number" min="1" defaultValue={i.day_no}/></label><label>Sort<input name="sort_order" type="number" min="0" defaultValue={i.sort_order}/></label></div><label>Judul<input name="title" defaultValue={i.title}/></label><label>Lokasi<input name="location" defaultValue={i.location ?? ''}/></label><label>Deskripsi<textarea name="description" rows={3} defaultValue={i.description ?? ''}/></label><label classNama paket="checkLine"><input name="is_published" type="checkbox" defaultChecked={i.is_published}/> Publikasikan ke katalog</label><button type="submit" classNama paket="secondaryCta">Simpan itinerary</button></form>)}</div>
          </div>
        </section>
        <section classNama paket="dashCard"><div classNama paket="dashHead"><div><span classNama paket="eyebrow">DAFTAR KEBERANGKATAN</span><h3>Keberangkatan operasional</h3></div><span classNama paket="catalogMeta">{departureRows.length} data</span></div>
          <div classNama paket="packageList">{departureRows.length===0?<div classNama paket="emptyState">Belum ada departure. Buat planned departure di panel atas.</div>:departureRows.map(d=>{const p=packageRows.find(x=>x.id===d.package_id);return <form action={updateBerangkat} classNama paket="packageRecord" key={d.id}><input type="hidden" name="id" value={d.id}/><div classNama paket="packageRecordTop"><div><b>{d.departure_code}</b><span>{p?.package_code ?? 'Paket tidak diketahui'} · {d.capacity ?? '—'} pax</span></div><strong classNama paket={'statusBadge '+String(d.status).toLowerCase()}>{d.status}</strong></div><div classNama paket="formTwo"><label>Berangkat<input name="departure_date" type="date" defaultValue={d.departure_date}/></label><label>Kembali<input name="return_date" type="date" defaultValue={d.return_date ?? ''}/></label></div><div classNama paket="formTwo"><label>Kapasitas<input name="capacity" type="number" min="1" defaultValue={d.capacity ?? ''}/></label><label>Status<select name="status" defaultValue={d.status}><option>PLANNED</option><option>READY</option><option>CANCELLED</option><option>CLOSED</option></select></label></div><label>Catatan<textarea name="notes" rows={2} defaultValue={d.notes ?? ''}/></label><button type="submit" classNama paket="secondaryCta">Simpan keberangkatan</button></form>})}</div>
        </section>
      </div>
    </main>
  </div>
}

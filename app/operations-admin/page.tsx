import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireCapability } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'
import { createFlight, updateFlight, deleteFlight, createHotel, updateHotel, deleteHotel, createTransport, updateTransport, deleteTransport } from './actions'

const input = 'controlInput'
const select = 'controlInput'
const submit = 'controlButton'

export default async function OperationsAdminPage() {
  try { await requireCapability('departure.read') } catch { redirect('/login?next=/operations-admin') }
  const access = await requireCapability('departure.read')
  const sb = await createServerSupabaseClient()
  const [{ data: departures }, { data: flights }, { data: hotels }, { data: transports }] = await Promise.all([
    sb.schema('operations').from('departures').select('id,departure_code,departure_date,status').eq('organization_id', access.organizationId).order('departure_date', { ascending: true }),
    sb.schema('operations').from('flights').select('id,departure_id,flight_no,airline,route,departure_at,arrival_at,terminal,status').order('departure_at', { ascending: true }),
    sb.schema('operations').from('hotels').select('id,departure_id,city,hotel_name,address,check_in,check_out,rooming_uri').order('check_in', { ascending: true }),
    sb.schema('operations').from('transports').select('id,departure_id,service_type,provider_name,vehicle_identifier,pickup_point,dropoff_point,scheduled_at,status').order('scheduled_at', { ascending: true })
  ])
  const depMap = new Map((departures ?? []).map(d => [d.id, d.departure_code]))
  return <main className="controlPage">
    <div className="moduleHero">
      <div><span className="eyebrow">PHASE 19 · FLIGHT / HOTEL / TRANSPORT</span><h1>Journey Operations Control</h1><p>Control operational suppliers and schedules per departure with organization scope, capability checks, and RLS enforcement.</p></div>
      <div className="moduleHeroStamp">OPS<br/>CONTROL</div>
    </div>
    <div className="controlBack"><Link href="/admin">← Admin Control Center</Link><Link href="/operations">Departure Operations →</Link></div>
    <section className="controlGrid">
      <section className="sectionCard"><h3>Flight Control</h3>
        <form action={createFlight} className="controlForm">
          <select name="departure_id" className={select} required><option value="">Departure…</option>{(departures ?? []).map(d=><option key={d.id} value={d.id}>{d.departure_code} · {d.departure_date}</option>)}</select>
          <input name="flight_no" className={input} placeholder="Flight number" required/><input name="airline" className={input} placeholder="Airline"/>
          <input name="route" className={input} placeholder="Route, e.g. CGK → JED"/><input name="terminal" className={input} placeholder="Terminal"/>
          <input name="departure_at" type="datetime-local" className={input}/><input name="arrival_at" type="datetime-local" className={input}/>
          <select name="status" className={select}><option>PLANNED</option><option>CONFIRMED</option><option>DELAYED</option><option>CANCELLED</option></select>
          <button className={submit}>Add flight</button>
        </form>
        <div className="controlRows">{(flights ?? []).map(f=><div className="controlRow" key={f.id}>
          <form action={updateFlight} className="inlineForm"><input type="hidden" name="id" value={f.id}/><b>{depMap.get(f.departure_id) ?? '—'}</b><input name="flight_no" className={input} defaultValue={f.flight_no ?? ''}/><input name="airline" className={input} defaultValue={f.airline ?? ''}/><input name="route" className={input} defaultValue={f.route ?? ''}/><input name="terminal" className={input} defaultValue={f.terminal ?? ''}/><select name="status" className={select} defaultValue={f.status}><option>PLANNED</option><option>CONFIRMED</option><option>DELAYED</option><option>CANCELLED</option></select><button className={submit}>Save</button></form>
          <form action={deleteFlight}><input type="hidden" name="id" value={f.id}/><button className="dangerButton">Delete</button></form>
        </div>)}</div>
      </section>
      <section className="sectionCard"><h3>Hotel Control</h3>
        <form action={createHotel} className="controlForm">
          <select name="departure_id" className={select} required><option value="">Departure…</option>{(departures ?? []).map(d=><option key={d.id} value={d.id}>{d.departure_code} · {d.departure_date}</option>)}</select>
          <input name="hotel_name" className={input} placeholder="Hotel name" required/><input name="city" className={input} placeholder="City" required/><input name="address" className={input} placeholder="Address"/>
          <input name="check_in" type="datetime-local" className={input}/><input name="check_out" type="datetime-local" className={input}/><input name="rooming_uri" className={input} placeholder="Rooming evidence URI"/>
          <button className={submit}>Add hotel</button>
        </form>
        <div className="controlRows">{(hotels ?? []).map(h=><div className="controlRow" key={h.id}>
          <form action={updateHotel} className="inlineForm"><input type="hidden" name="id" value={h.id}/><b>{depMap.get(h.departure_id) ?? '—'}</b><input name="hotel_name" className={input} defaultValue={h.hotel_name}/><input name="city" className={input} defaultValue={h.city}/><input name="address" className={input} defaultValue={h.address ?? ''}/><button className={submit}>Save</button></form>
          <form action={deleteHotel}><input type="hidden" name="id" value={h.id}/><button className="dangerButton">Delete</button></form>
        </div>)}</div>
      </section>
      <section className="sectionCard"><h3>Transport Control</h3>
        <form action={createTransport} className="controlForm">
          <select name="departure_id" className={select} required><option value="">Departure…</option>{(departures ?? []).map(d=><option key={d.id} value={d.id}>{d.departure_code} · {d.departure_date}</option>)}</select>
          <input name="service_type" className={input} placeholder="Service type" required/><input name="provider_name" className={input} placeholder="Provider"/><input name="vehicle_identifier" className={input} placeholder="Vehicle identifier"/>
          <input name="pickup_point" className={input} placeholder="Pickup point"/><input name="dropoff_point" className={input} placeholder="Dropoff point"/><input name="scheduled_at" type="datetime-local" className={input}/>
          <select name="status" className={select}><option>PLANNED</option><option>CONFIRMED</option><option>IN_TRANSIT</option><option>COMPLETED</option><option>CANCELLED</option></select>
          <button className={submit}>Add transport</button>
        </form>
        <div className="controlRows">{(transports ?? []).map(t=><div className="controlRow" key={t.id}>
          <form action={updateTransport} className="inlineForm"><input type="hidden" name="id" value={t.id}/><b>{depMap.get(t.departure_id) ?? '—'}</b><input name="service_type" className={input} defaultValue={t.service_type}/><input name="provider_name" className={input} defaultValue={t.provider_name ?? ''}/><input name="vehicle_identifier" className={input} defaultValue={t.vehicle_identifier ?? ''}/><input name="pickup_point" className={input} defaultValue={t.pickup_point ?? ''}/><input name="dropoff_point" className={input} defaultValue={t.dropoff_point ?? ''}/><select name="status" className={select} defaultValue={t.status}><option>PLANNED</option><option>CONFIRMED</option><option>IN_TRANSIT</option><option>COMPLETED</option><option>CANCELLED</option></select><button className={submit}>Save</button></form>
          <form action={deleteTransport}><input type="hidden" name="id" value={t.id}/><button className="dangerButton">Delete</button></form>
        </div>)}</div>
      </section>
    </section>
  </main>
}

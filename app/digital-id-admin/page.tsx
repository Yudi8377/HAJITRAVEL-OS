import Link from 'next/link'
import { requireCapability } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'
import { issueDigitalId,revokeDigitalId } from './actions'
export const dynamic='force-dynamic'
export default async function Page(){
 const a=await requireCapability('digital_id.read'); const s=await createServerSupabaseClient()
 const [{data:ids},{data:r}]=await Promise.all([
  s.schema('identity').from('digital_pilgrim_ids').select('*').eq('organization_id',a.organizationId).order('created_at',{ascending:false}),
  s.schema('jamaah').from('registrations').select('id,registration_no,jamaah_id').eq('organization_id',a.organizationId).order('created_at',{ascending:false})
 ])
 const ji=[...new Set((r??[]).map(x=>x.jamaah_id))]
 const {data:j}=ji.length?await s.schema('jamaah').from('profiles').select('id,full_name,jamaah_no').in('id',ji):{data:[]}
 const jm=new Map((j??[]).map(x=>[x.id,x.jamaah_no+' · '+x.full_name]))
 return <main className='controlPage'><div className='moduleHero'><div><span className='eyebrow'>PHASE 22 · DIGITAL PILGRIM ID</span><h1>Digital Pilgrim Identity</h1><p>Operational identity for internal journey control. QR is the primary fallback; NFC/BLE remain capability flags until supported hardware is integrated.</p></div><div className='moduleHeroStamp'>DIGITAL<br/>IDENTITY</div></div>
 <div className='controlBack'><Link href='/admin'>← Admin Control Center</Link><Link href='/journey-admin'>Journey →</Link></div>
 <section className='sectionCard'><div className='dashHead'><div><span className='eyebrow'>ISSUE IDENTITY</span><h3>Issue Digital Pilgrim ID</h3></div></div>
 <form action={issueDigitalId} className='controlForm'><select name='registration_id' className='controlInput' required><option value=''>Registration…</option>{(r??[]).map(x=><option key={x.id} value={x.id}>{x.registration_no} · {jm.get(x.jamaah_id)??'Jamaah'}</option>)}</select><label style={{display:'flex',gap:10,alignItems:'flex-start',gridColumn:'1/-1'}}><input type='checkbox' name='consent_attested' required/><span>I confirm that documented pilgrim consent for operational digital identity has been obtained and can be evidenced.</span></label><button className='controlButton'>Issue Digital ID</button></form></section>
 <section className='sectionCard'><div className='dashHead'><div><span className='eyebrow'>IDENTITY REGISTER</span><h3>Issued identities</h3></div></div><div className='controlRows'>{(ids??[]).map(x=><div className='controlRow' key={x.id}><span><b>{x.digital_id_no}</b> · {x.status}</span><span>{jm.get(x.jamaah_id)??'Jamaah'}</span><span>QR {x.qr_enabled?'READY':'OFF'} · NFC {x.nfc_enabled?'READY':'NOT INTEGRATED'} · BLE {x.ble_enabled?'READY':'NOT INTEGRATED'}</span><span>Scans {x.scan_count}</span><Link className='controlButton' href={'/digital-id/scan?token='+encodeURIComponent(x.qr_token)}>Open scan credential</Link>{x.status==='ISSUED'?<form action={revokeDigitalId}><input type='hidden' name='id' value={x.id}/><button className='controlButton'>Revoke</button></form>:null}</div>)}</div></section>
 </main>
}
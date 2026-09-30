'use client'
import { FormEvent,useState } from 'react'
import { ArrowRight,CheckCircle2,Loader2 } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

type Props = {
  initialIntent?: 'CONSULTATION' | 'BOOKING_REQUEST'
  initialPackageId?: string
  initialDepartureId?: string
}
function client(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error('HAJITRAVEL Supabase target is not configured.');return createBrowserClient(url,key)}

export default function InquiryForm({initialIntent='CONSULTATION',initialPackageId,initialDepartureId}:Props){
  const[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState('')
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError('')
    const form=new FormData(event.currentTarget)
    try{
      const{error:insertError}=await client().from('travel_inquiries').insert({
        name:String(form.get('name')||'').trim(),
        phone:String(form.get('phone')||'').trim(),
        email:String(form.get('email')||'').trim()||null,
        journey_type:String(form.get('journey_type')||'CONSULTATION'),
        preferred_period:String(form.get('preferred_period')||'').trim()||null,
        message:String(form.get('message')||'').trim()||null,
        consent:form.get('consent')==='on',
        package_id:initialPackageId||null,
        departure_id:initialDepartureId||null,
        intent:initialIntent,
        party_size:form.get('party_size')?Number(form.get('party_size')):null
      })
      if(insertError)throw insertError
      setSent(true);event.currentTarget.reset()
    }catch(err){setError(err instanceof Error?err.message:'Inquiry gagal dikirim. Silakan coba lagi.')}
    finally{setBusy(false)}
  }
  if(sent)return <div className="inquirySuccess"><CheckCircle2 size={32}/><h2>Permintaan diterima.</h2><p>{initialIntent==='BOOKING_REQUEST'?'Permintaan booking Anda sudah masuk ke operating system untuk diverifikasi tim.':'Kebutuhan perjalanan Anda sudah masuk ke sistem inquiry.'}</p><button onClick={()=>setSent(false)} className="detailPortal">Kirim permintaan lain</button></div>
  return <form className="inquiryForm" onSubmit={submit}>
    <div className="inquiryGrid">
      <label>Nama lengkap<input name="name" required minLength={2} maxLength={120} autoComplete="name"/></label>
      <label>No. WhatsApp / Telepon<input name="phone" required minLength={6} maxLength={40} autoComplete="tel"/></label>
      <label>Email<input name="email" type="email" maxLength={160} autoComplete="email"/></label>
      <label>Jenis perjalanan<select name="journey_type" defaultValue="CONSULTATION"><option value="CONSULTATION">Konsultasi umum</option><option value="UMRAH">Umrah</option><option value="HAJI_KHUSUS">Haji Khusus</option><option value="PRIVATE">Private / Family</option></select></label>
      <label>Jumlah jamaah<input name="party_size" type="number" min="1" max="999" inputMode="numeric"/></label>
      <label>Periode yang diinginkan<input name="preferred_period" maxLength={80} placeholder="Contoh: akhir 2026 / fleksibel"/></label>
      <label className="inquiryWide">Pesan / kebutuhan<textarea name="message" rows={5} maxLength={2000} placeholder="Ceritakan kebutuhan, keberangkatan, atau pertanyaan Anda."/></label>
    </div>
    <label className="consent"><input name="consent" type="checkbox" required/><span>Saya setuju data ini digunakan untuk menindaklanjuti konsultasi/permintaan booking perjalanan.</span></label>
    {error&&<div className="inquiryError" role="alert">{error}</div>}
    <button className="goldButton" disabled={busy} type="submit">{busy?<><Loader2 className="spin" size={16}/> Mengirim…</>:<>Kirim permintaan <ArrowRight size={16}/></>}</button>
  </form>
}

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'
import { resolveAccessContext } from '../../src/access/runtime'
import InquiryQueue from './InquiryQueue'
export const dynamic='force-dynamic'
export default async function InquiriesPage(){const ctx=await resolveAccessContext();if(!ctx.authenticated)redirect('/login');const sb=await createServerSupabaseClient();const{data,error}=await sb.from('travel_inquiries').select('id,created_at,name,phone,email,journey_type,preferred_period,message,status,intent,party_size,package_id,departure_id').order('created_at',{ascending:false});if(error)throw error;return <main className="modulePage"><div className="moduleHeader"><div><span className="sectionKicker">PUBLIC INTAKE</span><h1>Journey inquiries</h1><p>Inquiry publik dan permintaan booking yang masuk dari website. Status berikut dikelola tim operasional.</p></div></div><InquiryQueue rows={data??[]}/></main>}
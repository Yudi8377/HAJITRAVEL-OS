'use server'

import { revalidatePath } from 'next/cache'
import { requireCapability } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'
function value(fd: FormData, key: string) { return String(fd.get(key) ?? '').trim() }
export async function createRegistration(formData: FormData) {
 const access=await requireCapability('registration.create'); const sb=await createServerSupabaseClient()
 const jamaahId=value(formData,'jamaah_id'), packageId=value(formData,'package_id'), departureId=value(formData,'departure_id')||null, registrationNo=value(formData,'registration_no')
 if(!jamaahId||!packageId||!registrationNo) throw new Error('INVALID_REGISTRATION')
 const [{data:j},{data:p},{data:d}]=await Promise.all([sb.schema('jamaah').from('profiles').select('id').eq('id',jamaahId).eq('organization_id',access.organizationId).single(),sb.schema('operations').from('packages').select('id,status').eq('id',packageId).eq('organization_id',access.organizationId).single(),departureId?sb.schema('operations').from('departures').select('id,package_id,status').eq('id',departureId).eq('organization_id',access.organizationId).single():Promise.resolve({data:null})])
 if(!j) throw new Error('JAMAAH_NOT_FOUND'); if(!p) throw new Error('PACKAGE_NOT_FOUND'); if(departureId&&(!d||d.package_id!==packageId||['CANCELLED','CLOSED'].includes(d.status))) throw new Error('INVALID_DEPARTURE')
 const {data:created,error}=await sb.schema('jamaah').from('registrations').insert({organization_id:access.organizationId,jamaah_id:jamaahId,package_id:packageId,departure_id:departureId,registration_no:registrationNo,status:'DRAFT',maker_user_id:access.userId,notes:value(formData,'notes')||null}).select('id').single()
 if(error) throw new Error(error.message)
 const invoiceId=value(formData,'invoice_id')
 if(invoiceId){const {data:i,error:ie}=await sb.schema('finance').from('invoices').select('id,jamaah_id').eq('id',invoiceId).eq('organization_id',access.organizationId).single();if(ie||!i||i.jamaah_id!==jamaahId) throw new Error('INVALID_INVOICE_LINK');const {error:le}=await sb.schema('jamaah').from('registration_finance_links').insert({organization_id:access.organizationId,registration_id:created.id,invoice_id:i.id});if(le) throw new Error(le.message)}
 revalidatePath('/registrations-admin'); revalidatePath('/finance')
}
export async function updateRegistration(formData: FormData){
 const access=await requireCapability('registration.update'); const sb=await createServerSupabaseClient(); const id=value(formData,'id'),status=value(formData,'status');
 if(!id||!['DRAFT','SUBMITTED','VERIFIED','CONFIRMED','CANCELLED','COMPLETED'].includes(status)) throw new Error('INVALID_REGISTRATION_STATUS')
 const now=new Date().toISOString(); const timestamps:any={}; if(status==='SUBMITTED')timestamps.submitted_at=now;if(status==='VERIFIED')timestamps.verified_at=now;if(status==='CONFIRMED')timestamps.confirmed_at=now;if(status==='COMPLETED')timestamps.completed_at=now;if(status==='CANCELLED')timestamps.cancelled_at=now
 const {error}=await sb.schema('jamaah').from('registrations').update({status,notes:value(formData,'notes')||null,...timestamps}).eq('id',id).eq('organization_id',access.organizationId); if(error)throw new Error(error.message); revalidatePath('/registrations-admin');revalidatePath('/admin')
}
export async function linkRegistrationInvoice(formData: FormData){
 const access=await requireCapability('registration.update'); const sb=await createServerSupabaseClient(); const registrationId=value(formData,'registration_id'),invoiceId=value(formData,'invoice_id'); if(!registrationId||!invoiceId)throw new Error('INVALID_FINANCE_LINK')
 const [{data:r},{data:i}]=await Promise.all([sb.schema('jamaah').from('registrations').select('id,jamaah_id').eq('id',registrationId).eq('organization_id',access.organizationId).single(),sb.schema('finance').from('invoices').select('id,jamaah_id').eq('id',invoiceId).eq('organization_id',access.organizationId).single()]); if(!r||!i||r.jamaah_id!==i.jamaah_id)throw new Error('INVOICE_JAMAAH_MISMATCH')
 const {error}=await sb.schema('jamaah').from('registration_finance_links').upsert({organization_id:access.organizationId,registration_id:registrationId,invoice_id:invoiceId},{onConflict:'organization_id,registration_id'});if(error)throw new Error(error.message);revalidatePath('/registrations-admin')
}

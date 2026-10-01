'use server'
import { randomBytes, createHash } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { requireCapability } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'
const v=(f:FormData,k:string)=>String(f.get(k)??'').trim()
export async function issueDigitalId(f:FormData){
 const a=await requireCapability('digital_id.issue'); const s=await createServerSupabaseClient()
 const rid=v(f,'registration_id'); if(!rid || f.get('consent_attested')!=='on') throw new Error('CONSENT_ATTESTATION_REQUIRED')
 const {data:r}=await s.schema('jamaah').from('registrations').select('id,registration_no,jamaah_id,departure_id').eq('id',rid).eq('organization_id',a.organizationId).single()
 if(!r) throw new Error('REGISTRATION_NOT_FOUND')
 const {data:existing}=await s.schema('identity').from('digital_pilgrim_ids').select('id,status').eq('registration_id',rid).eq('organization_id',a.organizationId).maybeSingle()
 if(existing?.status==='ISSUED') throw new Error('DIGITAL_ID_ALREADY_ISSUED')
 const token=randomBytes(32).toString('base64url'); const hash=createHash('sha256').update(token).digest('hex')
 const no='DID-'+randomBytes(5).toString('hex').toUpperCase()
 const {error}=await s.schema('identity').from('digital_pilgrim_ids').upsert({organization_id:a.organizationId,registration_id:rid,jamaah_id:r.jamaah_id,digital_id_no:no,qr_token:token,qr_token_hash:hash,token_hint:token.slice(0,8)+'…',status:'ISSUED',issued_by:a.userId,qr_enabled:true,nfc_enabled:false,ble_enabled:false,consent_required:true,consent_granted_at:new Date().toISOString()},{onConflict:'organization_id,registration_id'})
 if(error) throw new Error(error.message)
 const {error:ce}=await s.schema('jamaah').from('registration_consents').insert({organization_id:a.organizationId,registration_id:rid,consent_type:'DIGITAL_ID',version:'1.0',consented:true,consented_at:new Date().toISOString(),consented_by:a.userId})
 if(ce) throw new Error(ce.message)
 revalidatePath('/digital-id-admin')
}
export async function revokeDigitalId(f:FormData){
 const a=await requireCapability('digital_id.revoke'); const s=await createServerSupabaseClient(); const id=v(f,'id')
 if(!id) throw new Error('INVALID_ID')
 const {error}=await s.schema('identity').from('digital_pilgrim_ids').update({status:'REVOKED',revoked_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',id).eq('organization_id',a.organizationId)
 if(error) throw new Error(error.message); revalidatePath('/digital-id-admin')
}
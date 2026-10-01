'use server'
import { revalidatePath } from 'next/cache'
import { requireCapability } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'
const v=(f:FormData,k:string)=>String(f.get(k)??'').trim()
const n=(f:FormData,k:string)=>v(f,k)||null
export async function createJourneyEvent(f:FormData){
 const a=await requireCapability('journey.update'); const s=await createServerSupabaseClient()
 const rid=v(f,'registration_id'), did=v(f,'departure_id'); if(!rid||!did||!v(f,'event_code')||!v(f,'event_label')) throw new Error('INVALID_EVENT')
 const {data:r}=await s.schema('jamaah').from('registrations').select('id').eq('id',rid).eq('organization_id',a.organizationId).single(); if(!r) throw new Error('REGISTRATION_NOT_FOUND')
 const {data:d}=await s.schema('operations').from('departures').select('id').eq('id',did).eq('organization_id',a.organizationId).single(); if(!d) throw new Error('DEPARTURE_NOT_FOUND')
 const {error}=await s.schema('operations').from('pilgrim_journey_events').insert({organization_id:a.organizationId,registration_id:rid,departure_id:did,event_code:v(f,'event_code'),event_label:v(f,'event_label'),status:v(f,'status')||'PLANNED',occurred_at:n(f,'occurred_at'),location_label:n(f,'location_label'),notes:n(f,'notes'),evidence_uri:n(f,'evidence_uri'),recorded_by:a.userId})
 if(error) throw new Error(error.message); revalidatePath('/journey-admin')
}
export async function updateJourneyEvent(f:FormData){
 const a=await requireCapability('journey.update'); const s=await createServerSupabaseClient(); const id=v(f,'id')
 const {error}=await s.schema('operations').from('pilgrim_journey_events').update({event_label:v(f,'event_label'),status:v(f,'status'),occurred_at:n(f,'occurred_at'),location_label:n(f,'location_label'),notes:n(f,'notes'),evidence_uri:n(f,'evidence_uri')}).eq('id',id).eq('organization_id',a.organizationId)
 if(error) throw new Error(error.message); revalidatePath('/journey-admin')
}
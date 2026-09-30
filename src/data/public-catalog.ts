import { createServerSupabaseClient } from '../lib/supabase/server'

export type PublicPackage = {
  id: string
  package_code: string
  package_type: 'UMRAH' | 'HAJI_KHUSUS'
  name: string
  currency: string
  effective_from: string | null
  effective_to: string | null
  status: 'PUBLISHED'
}
export type PublicDeparture = {
  id: string
  package_id: string
  departure_code: string
  departure_date: string
  return_date: string | null
  capacity: number | null
  status: 'PLANNED' | 'READY'
}
export async function getPublicPackages() {
  const sb = await createServerSupabaseClient()
  const { data, error } = await sb.schema('operations').from('packages')
    .select('id,package_code,package_type,name,currency,effective_from,effective_to,status')
    .eq('status', 'PUBLISHED').order('package_type').order('name')
  if (error) throw error
  return (data ?? []) as PublicPackage[]
}
export async function getPublicPackage(id: string) {
  const sb = await createServerSupabaseClient()
  const { data: packageRow, error: packageError } = await sb.schema('operations').from('packages')
    .select('id,package_code,package_type,name,currency,effective_from,effective_to,status')
    .eq('id', id).eq('status', 'PUBLISHED').single()
  if (packageError) return null
  const { data: departures, error: departureError } = await sb.schema('operations').from('departures')
    .select('id,package_id,departure_code,departure_date,return_date,capacity,status')
    .eq('package_id', id).in('status', ['PLANNED', 'READY']).order('departure_date')
  if (departureError) throw departureError
  return { package: packageRow as PublicPackage, departures: (departures ?? []) as PublicDeparture[] }
}

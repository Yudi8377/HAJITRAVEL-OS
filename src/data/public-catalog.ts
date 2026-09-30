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
export type PublicItinerary = {
  id: string
  package_id: string
  day_no: number
  title: string
  description: string | null
  location: string | null
}
export type PublicFaq = {
  id: string
  question: string
  answer: string
  category: string
}

export async function getPublicPackages() {
  const sb = await createServerSupabaseClient()
  const { data, error } = await sb.schema('operations').from('packages')
    .select('id,package_code,package_type,name,currency,effective_from,effective_to,status')
    .eq('status', 'PUBLISHED')
    .or('effective_from.is.null,effective_from.lte.' + new Date().toISOString().slice(0, 10))
    .or('effective_to.is.null,effective_to.gte.' + new Date().toISOString().slice(0, 10))
    .order('package_type').order('name')
  if (error) throw error
  return (data ?? []) as PublicPackage[]
}

export async function getPublicPackage(id: string) {
  const sb = await createServerSupabaseClient()
  const { data: packageRow, error: packageError } = await sb.schema('operations').from('packages')
    .select('id,package_code,package_type,name,currency,effective_from,effective_to,status')
    .eq('id', id).eq('status', 'PUBLISHED').single()
  if (packageError) return null

  const [{ data: departures, error: departureError }, { data: itinerary, error: itineraryError }] = await Promise.all([
    sb.schema('operations').from('departures')
      .select('id,package_id,departure_code,departure_date,return_date,capacity,status')
      .eq('package_id', id).in('status', ['PLANNED', 'READY']).order('departure_date'),
    sb.from('travel_itineraries')
      .select('id,package_id,day_no,title,description,location')
      .eq('package_id', id).eq('is_published', true).order('sort_order').order('day_no')
  ])
  if (departureError) throw departureError
  if (itineraryError) throw itineraryError
  return {
    package: packageRow as PublicPackage,
    departures: (departures ?? []) as PublicDeparture[],
    itinerary: (itinerary ?? []) as PublicItinerary[]
  }
}

export async function getPublicFaqs() {
  const sb = await createServerSupabaseClient()
  const { data, error } = await sb.from('travel_faq')
    .select('id,question,answer,category')
    .eq('is_published', true)
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as PublicFaq[]
}

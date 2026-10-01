const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

function restUrl(path: string, query: string) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('HAJITRAVEL Supabase target is not configured.')
  return `${SUPABASE_URL}/rest/v1/${path}?${query}`
}

async function publicRest(path: string, query: string, profile?: string) {
  const response = await fetch(restUrl(path, query), {
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY!}`,
      Accept: 'application/json',
      ...(profile ? { 'Accept-Profile': profile } : {}),
    },
    cache: 'no-store',
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Public catalog request failed (${response.status}): ${detail.slice(0, 500)}`)
  }
  return response.json()
}

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
  try {
    const today = new Date().toISOString().slice(0, 10)
  const data = await publicRest(
    'packages',
    `select=id,package_code,package_type,name,currency,effective_from,effective_to,status&status=eq.PUBLISHED&or=(effective_from.is.null,effective_from.lte.${today})&or=(effective_to.is.null,effective_to.gte.${today})&order=package_type,name`,
    'operations',
  )
    return (data ?? []) as PublicPackage[]
  } catch (error) {
    console.error('Public package catalog unavailable:', error)
    return []
  }
}

export async function getPublicPackage(id: string) {
  try {
    const today = new Date().toISOString().slice(0, 10)
  const [packages, departures, itinerary] = await Promise.all([
    publicRest(
      'packages',
      `select=id,package_code,package_type,name,currency,effective_from,effective_to,status&id=eq.${encodeURIComponent(id)}&status=eq.PUBLISHED&or=(effective_from.is.null,effective_from.lte.${today})&or=(effective_to.is.null,effective_to.gte.${today})`,
      'operations',
    ),
    publicRest(
      'departures',
      `select=id,package_id,departure_code,departure_date,return_date,capacity,status&package_id=eq.${encodeURIComponent(id)}&in=status.(PLANNED,READY)&order=departure_date`,
      'operations',
    ),
    publicRest(
      'travel_itineraries',
      `select=id,package_id,day_no,title,description,location&package_id=eq.${encodeURIComponent(id)}&is_published=eq.true&order=sort_order,day_no`,
    ),
  ])
  const packageRow = packages?.[0]
  if (!packageRow) return null
    return {
      package: packageRow as PublicPackage,
      departures: (departures ?? []) as PublicDeparture[],
      itinerary: (itinerary ?? []) as PublicItinerary[],
    }
  } catch (error) {
    console.error('Public package detail unavailable:', error)
    return null
  }
}

export async function getPublicFaqs() {
  try {
    const data = await publicRest(
    'travel_faq',
    'select=id,question,answer,category&is_published=eq.true&order=sort_order',
  )
    return (data ?? []) as PublicFaq[]
  } catch (error) {
    console.error('Public FAQ unavailable:', error)
    return []
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { requireCapability } from '../../src/access/runtime'
import { createServerSupabaseClient } from '../../src/lib/supabase/server'

function value(fd: FormData, key: string) {
  return String(fd.get(key) ?? '').trim()
}
function nullable(fd: FormData, key: string) {
  return value(fd, key) || null
}
function requireId(fd: FormData, key: string) {
  const id = value(fd, key)
  if (!id) throw new Error('INVALID_ID')
  return id
}

export async function createFlight(fd: FormData) {
  const access = await requireCapability('departure.create')
  const sb = await createServerSupabaseClient()
  const departureId = value(fd, 'departure_id')
  const flightNo = value(fd, 'flight_no')
  if (!departureId || !flightNo) throw new Error('INVALID_FLIGHT')
  const { data: departure } = await sb.schema('operations').from('departures')
    .select('id').eq('id', departureId).eq('organization_id', access.organizationId).single()
  if (!departure) throw new Error('DEPARTURE_NOT_FOUND')
  const { error } = await sb.schema('operations').from('flights').insert({
    departure_id: departureId, flight_no: flightNo, airline: nullable(fd, 'airline'),
    route: nullable(fd, 'route'), departure_at: nullable(fd, 'departure_at'),
    arrival_at: nullable(fd, 'arrival_at'), terminal: nullable(fd, 'terminal'),
    status: value(fd, 'status') || 'PLANNED'
  })
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin')
  revalidatePath('/operations')
}

export async function updateFlight(fd: FormData) {
  await requireCapability('departure.update')
  const sb = await createServerSupabaseClient()
  const id = requireId(fd, 'id')
  const { error } = await sb.schema('operations').from('flights').update({
    flight_no: value(fd, 'flight_no'), airline: nullable(fd, 'airline'), route: nullable(fd, 'route'),
    departure_at: nullable(fd, 'departure_at'), arrival_at: nullable(fd, 'arrival_at'),
    terminal: nullable(fd, 'terminal'), status: value(fd, 'status')
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin'); revalidatePath('/operations')
}

export async function deleteFlight(fd: FormData) {
  await requireCapability('departure.update')
  const sb = await createServerSupabaseClient()
  const id = requireId(fd, 'id')
  const { error } = await sb.schema('operations').from('flights').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin'); revalidatePath('/operations')
}

export async function createHotel(fd: FormData) {
  const access = await requireCapability('departure.create')
  const sb = await createServerSupabaseClient()
  const departureId = value(fd, 'departure_id')
  const hotelName = value(fd, 'hotel_name')
  const city = value(fd, 'city')
  if (!departureId || !hotelName || !city) throw new Error('INVALID_HOTEL')
  const { data: departure } = await sb.schema('operations').from('departures')
    .select('id').eq('id', departureId).eq('organization_id', access.organizationId).single()
  if (!departure) throw new Error('DEPARTURE_NOT_FOUND')
  const { error } = await sb.schema('operations').from('hotels').insert({
    departure_id: departureId, city, hotel_name: hotelName, address: nullable(fd, 'address'),
    check_in: nullable(fd, 'check_in'), check_out: nullable(fd, 'check_out'),
    rooming_uri: nullable(fd, 'rooming_uri')
  })
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin'); revalidatePath('/operations')
}

export async function updateHotel(fd: FormData) {
  await requireCapability('departure.update')
  const sb = await createServerSupabaseClient()
  const id = requireId(fd, 'id')
  const { error } = await sb.schema('operations').from('hotels').update({
    city: value(fd, 'city'), hotel_name: value(fd, 'hotel_name'), address: nullable(fd, 'address'),
    check_in: nullable(fd, 'check_in'), check_out: nullable(fd, 'check_out'),
    rooming_uri: nullable(fd, 'rooming_uri')
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin'); revalidatePath('/operations')
}

export async function deleteHotel(fd: FormData) {
  await requireCapability('departure.update')
  const sb = await createServerSupabaseClient()
  const id = requireId(fd, 'id')
  const { error } = await sb.schema('operations').from('hotels').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin'); revalidatePath('/operations')
}

export async function createTransport(fd: FormData) {
  const access = await requireCapability('departure.create')
  const sb = await createServerSupabaseClient()
  const departureId = value(fd, 'departure_id')
  const serviceType = value(fd, 'service_type')
  if (!departureId || !serviceType) throw new Error('INVALID_TRANSPORT')
  const { data: departure } = await sb.schema('operations').from('departures')
    .select('id').eq('id', departureId).eq('organization_id', access.organizationId).single()
  if (!departure) throw new Error('DEPARTURE_NOT_FOUND')
  const { error } = await sb.schema('operations').from('transports').insert({
    departure_id: departureId, service_type: serviceType, provider_name: nullable(fd, 'provider_name'),
    vehicle_identifier: nullable(fd, 'vehicle_identifier'), pickup_point: nullable(fd, 'pickup_point'),
    dropoff_point: nullable(fd, 'dropoff_point'), scheduled_at: nullable(fd, 'scheduled_at'),
    status: value(fd, 'status') || 'PLANNED'
  })
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin'); revalidatePath('/operations')
}

export async function updateTransport(fd: FormData) {
  await requireCapability('departure.update')
  const sb = await createServerSupabaseClient()
  const id = requireId(fd, 'id')
  const { error } = await sb.schema('operations').from('transports').update({
    service_type: value(fd, 'service_type'), provider_name: nullable(fd, 'provider_name'),
    vehicle_identifier: nullable(fd, 'vehicle_identifier'), pickup_point: nullable(fd, 'pickup_point'),
    dropoff_point: nullable(fd, 'dropoff_point'), scheduled_at: nullable(fd, 'scheduled_at'),
    status: value(fd, 'status')
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin'); revalidatePath('/operations')
}

export async function deleteTransport(fd: FormData) {
  await requireCapability('departure.update')
  const sb = await createServerSupabaseClient()
  const id = requireId(fd, 'id')
  const { error } = await sb.schema('operations').from('transports').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/operations-admin'); revalidatePath('/operations')
}

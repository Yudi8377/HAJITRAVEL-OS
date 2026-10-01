'use server'

import { revalidatePath } from 'next/cache'
import { requireCapability } from '../../../src/access/runtime'
import { createServerSupabaseClient } from '../../../src/lib/supabase/server'

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}
function optionalDate(formData: FormData, key: string) {
  const value = textValue(formData, key)
  return value || null
}

export async function createPackage(formData: FormData) {
  const access = await requireCapability('package.create')
  const sb = await createServerSupabaseClient()
  const packageCode = textValue(formData, 'package_code')
  const packageType = textValue(formData, 'package_type')
  const name = textValue(formData, 'name')
  if (!packageCode || !name || !['UMRAH','HAJI_KHUSUS'].includes(packageType)) throw new Error('INVALID_PACKAGE')
  const { error } = await sb.schema('operations').from('packages').insert({
    organization_id: access.organizationId,
    package_code: packageCode,
    package_type: packageType,
    name,
    version_no: 1,
    price: Number(formData.get('price') || 0),
    currency: textValue(formData, 'currency') || 'IDR',
    status: 'DRAFT',
    effective_from: optionalDate(formData, 'effective_from'),
    effective_to: optionalDate(formData, 'effective_to'),
    terms: textValue(formData, 'terms') || null,
    maker_user_id: access.userId,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/packages-admin')
  revalidatePath('/packages')
}

export async function updatePackage(formData: FormData) {
  const access = await requireCapability('package.update')
  const sb = await createServerSupabaseClient()
  const id = textValue(formData, 'id')
  if (!id) throw new Error('INVALID_PACKAGE_ID')
  const status = textValue(formData, 'status')
  const allowed = ['DRAFT','PUBLISHED','ARCHIVED']
  if (!allowed.includes(status)) throw new Error('INVALID_STATUS')
  const { error } = await sb.schema('operations').from('packages').update({
    name: textValue(formData, 'name'),
    package_type: textValue(formData, 'package_type'),
    price: Number(formData.get('price') || 0),
    currency: textValue(formData, 'currency') || 'IDR',
    status,
    effective_from: optionalDate(formData, 'effective_from'),
    effective_to: optionalDate(formData, 'effective_to'),
    terms: textValue(formData, 'terms') || null,
    version_no: Math.max(1, Number(formData.get('version_no') || 1)),
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/packages-admin')
  revalidatePath('/packages')
}

export async function createDeparture(formData: FormData) {
  const access = await requireCapability('departure.create')
  const sb = await createServerSupabaseClient()
  const packageId = textValue(formData, 'package_id')
  const departureCode = textValue(formData, 'departure_code')
  const departureDate = textValue(formData, 'departure_date')
  if (!packageId || !departureCode || !departureDate) throw new Error('INVALID_DEPARTURE')
  const { data: pkg, error: packageError } = await sb.schema('operations').from('packages').select('id').eq('id', packageId).eq('organization_id', access.organizationId).single()
  if (packageError || !pkg) throw new Error('PACKAGE_NOT_FOUND')
  const { error } = await sb.schema('operations').from('departures').insert({
    organization_id: access.organizationId,
    package_id: packageId,
    departure_code: departureCode,
    departure_date: departureDate,
    return_date: optionalDate(formData, 'return_date'),
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    status: 'PLANNED',
    notes: textValue(formData, 'notes') || null,
    maker_user_id: access.userId,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/packages-admin')
  revalidatePath('/packages')
}

export async function updateDeparture(formData: FormData) {
  const access = await requireCapability('departure.update')
  const sb = await createServerSupabaseClient()
  const id = textValue(formData, 'id')
  if (!id) throw new Error('INVALID_DEPARTURE_ID')
  const status = textValue(formData, 'status')
  if (!['PLANNED','READY','CANCELLED','CLOSED'].includes(status)) throw new Error('INVALID_DEPARTURE_STATUS')
  const { error } = await sb.schema('operations').from('departures').update({
    departure_code: textValue(formData, 'departure_code'),
    departure_date: textValue(formData, 'departure_date'),
    return_date: optionalDate(formData, 'return_date'),
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    status,
    notes: textValue(formData, 'notes') || null,
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/packages-admin')
  revalidatePath('/packages')
}

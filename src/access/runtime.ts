import type { AccessContext } from './types'
import type { Capability } from './capability'
import { createServerSupabaseClient } from '../lib/supabase/server'
export async function resolveAccessContext(): Promise<AccessContext> {
  const sb = await createServerSupabaseClient()
  const { data: claimsData, error: claimsError } = await sb.auth.getClaims()
  if (claimsError) throw claimsError
  const userId = claimsData?.claims?.sub as string | undefined
  if (!userId) return {authenticated:false,userId:null,organizationId:null,membershipId:null,role:null,capabilities:[]}
  const requestedOrg = claimsData?.claims?.organization_id as string | undefined
  let q = sb.schema('organization').from('organization_memberships').select('id,organization_id,status,role_id,roles(code)').eq('user_id',userId).eq('status','ACTIVE')
  if (requestedOrg) q = q.eq('organization_id',requestedOrg)
  const {data,error}=await q
  if(error) throw error
  if(!data?.length || (!requestedOrg && data.length>1)) return {authenticated:true,userId,organizationId:null,membershipId:null,role:null,capabilities:[]}
  const membership=data[0] as {id:string;organization_id:string;role_id:string;roles?:{code?:string}|null}
  const {data:roleCaps,error:capError}=await sb.schema('organization').from('role_capabilities').select('capabilities(code)').eq('role_id',membership.role_id)
  if(capError) throw capError
  return {authenticated:true,userId,organizationId:membership.organization_id,membershipId:membership.id,role:membership.roles?.code??null,capabilities:(roleCaps??[]).map((x:any)=>x.capabilities?.code).filter(Boolean)}
}
export async function requireCapability(capability:Capability){const ctx=await resolveAccessContext();if(!ctx.authenticated)throw new Error('AUTH_REQUIRED');if(!ctx.organizationId)throw new Error('ORGANIZATION_SCOPE_REQUIRED');if(!ctx.capabilities.includes(capability))throw new Error(`CAPABILITY_REQUIRED:${capability}`);return ctx}
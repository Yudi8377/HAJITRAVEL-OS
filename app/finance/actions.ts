'use server'
import {revalidatePath} from 'next/cache'
import {requireCapability} from '../../src/access/runtime'
import {createServerSupabaseClient} from '../../src/lib/supabase/server'
const v=(f:FormData,k:string)=>String(f.get(k)??'').trim()
export async function createInvoice(f:FormData){
 const a=await requireCapability('finance.create'), sb=await createServerSupabaseClient()
 const {error}=await sb.schema('finance').from('invoices').insert({organization_id:a.organizationId,jamaah_id:v(f,'jamaah_id'),invoice_no:v(f,'invoice_no'),amount:Number(f.get('amount')||0),due_date:v(f,'due_date')||null,status:'DRAFT'})
 if(error) throw new Error(error.message);revalidatePath('/finance');revalidatePath('/admin')
}
export async function createPayment(f:FormData){
 const a=await requireCapability('finance.create'), sb=await createServerSupabaseClient()
 const {data:inv,error:ie}=await sb.schema('finance').from('invoices').select('id,jamaah_id').eq('id',v(f,'invoice_id')).eq('organization_id',a.organizationId).single()
 if(ie||!inv) throw new Error('INVOICE_NOT_FOUND')
 const checker=v(f,'checker_user_id')
 const {error}=await sb.schema('finance').from('payments').insert({organization_id:a.organizationId,invoice_id:inv.id,amount:Number(f.get('amount')||0),channel:v(f,'channel')||null,status:'PENDING' ,checker_user_id:checker,maker_user_id:a.userId})
 if(error) throw new Error(error.message);revalidatePath('/finance');revalidatePath('/admin')
}

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )

  return NextResponse.json(
    {
      status: configured ? 'ok' : 'blocked',
      service: 'HAJI TRAVEL OS',
      environment: process.env.NODE_ENV,
      supabaseConfigured: configured,
    },
    {
      status: configured ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

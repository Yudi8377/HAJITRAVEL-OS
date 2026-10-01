'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, ChevronRight, ShieldCheck } from 'lucide-react'
import type { PublicPackage } from '../src/data/public-catalog'

function Ornament() {
  return <div className="sacredOrnament" aria-hidden="true"><span/><span/><span/></div>
}

export default function PublicCatalog() {
  const [packages, setPackages] = useState<PublicPackage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        if (!url || !key) return
        const today = new Date().toISOString().slice(0, 10)
        const query = new URLSearchParams({
          select: 'id,package_code,package_type,name,currency,effective_from,effective_to,status',
          status: 'eq.PUBLISHED',
          order: 'package_type,name',
        })
        query.set('or', `(effective_from.is.null,effective_from.lte.${today})`)
        const response = await fetch(`${url}/rest/v1/packages?${query.toString()}`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Accept: 'application/json',
            'Accept-Profile': 'operations',
          },
          cache: 'no-store',
        })
        if (!response.ok) return
        const rows = (await response.json()) as PublicPackage[]
        const active = rows.filter((row) => !row.effective_to || row.effective_to >= today)
        if (!cancelled) setPackages(active)
      } catch {
        // Public shell must remain usable when the data plane is unavailable.
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return <div className="catalogEmpty"><ShieldCheck size={25}/><h3>Menyiapkan program publik…</h3><p>Memuat program yang telah diterbitkan oleh operating system.</p></div>
  }

  if (packages.length === 0) {
    return <div className="catalogEmpty"><ShieldCheck size={25}/><h3>Belum ada program publik.</h3><p>Program akan muncul di sini setelah diterbitkan dari operating system. Tidak ada paket demo yang disamarkan sebagai data nyata.</p><Link href="/inquire" className="goldButton">Mulai konsultasi <ArrowRight size={16}/></Link></div>
  }

  return <>{packages.slice(0, 3).map((item, index) => (
    <article className={index === 0 ? 'programCard programFeatured' : 'programCard'} key={item.id}>
      <div className="programImage">
        <span>{item.package_type === 'HAJI_KHUSUS' ? 'HAJI KHUSUS' : 'UMRAH'}</span>
        <b>{'0' + (index + 1)}</b>
        <Ornament/>
        <div className="programImageLabel">{item.name}</div>
      </div>
      <div className="programBody">
        <div className="programMeta"><span>{item.package_code}</span><span>Published</span></div>
        <h3>{item.name}</h3>
        <p>Program resmi yang diterbitkan dari operating system. Detail keberangkatan, itinerary, dan layanan publik mengikuti data yang tersedia.</p>
        <Link href={'/packages/' + item.id}>Explore journey <ChevronRight size={15}/></Link>
      </div>
    </article>
  ))}</>
}

'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('HAJITRAVEL OS admin render error', error) }, [error])
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:32}}><section className="dashCard" style={{maxWidth:700,width:'100%'}}><span className="eyebrow">CONTROL CENTER ERROR</span><h1>Control center belum dapat dimuat</h1><p>Terjadi kegagalan saat memuat data workspace. Sesi dan data organisasi tetap dilindungi; tidak ada data sensitif yang ditampilkan pada halaman error.</p><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="primaryCta" onClick={() => reset()}>Coba lagi</button><Link href="/login?next=/admin" className="publicButton">Masuk ulang</Link><Link href="/" className="publicButton">Website</Link></div>{error?.digest && <small style={{display:'block',marginTop:20,opacity:.6}}>Reference: {error.digest}</small>}</section></main>
}

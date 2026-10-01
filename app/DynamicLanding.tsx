'use client'

import Link from 'next/link'
import { useEffect, useState, type CSSProperties } from 'react'
import { ArrowDownRight, ArrowRight, Compass, Sparkles } from 'lucide-react'
import PublicCatalog from './PublicCatalog'

const slides = [
  { kicker:'PERJALANAN SUCI', title:'Perjalanan yang layak dikenang.', text:'Haji & Umrah experience yang dirancang dengan ritme yang tenang, detail yang jelas, dan dukungan yang terasa sepanjang perjalanan.', scene:'makkah', photo:'https://images.unsplash.com/photo-1693590614566-1d3ea9ef32f7?auto=format&fit=crop&w=2400&q=85', place:'Makkah Al-Mukarramah', note:'Dimulai dengan niat.' },
  { kicker:'KOTA-KOTA SUCI', title:'Lebih dekat pada yang berarti.', text:'Dari persiapan di Indonesia hingga momen di Tanah Suci, setiap tahap dirancang agar jamaah dapat lebih fokus pada perjalanan ibadah.', scene:'madinah', photo:'https://images.unsplash.com/photo-1745775759814-9b60ed1718ed?auto=format&fit=crop&w=2400&q=85', place:'Madinah Al-Munawwarah', note:'Melangkah dengan tujuan.' },
  { kicker:'PENGALAMAN TERINTEGRASI', title:'Tertata dengan indah.', text:'Program, keberangkatan, itinerary, inquiry, dan operasional terhubung dalam satu ekosistem perjalanan yang hidup.', scene:'journey', photo:'https://images.unsplash.com/photo-1741615171144-a50cd53f4d7f?auto=format&fit=crop&w=2400&q=85', place:'Indonesia → Arab Saudi', note:'Setiap detail terhubung.' },
]

export default function DynamicLanding() {
  const [active, setActive] = useState(0)
    const slide = slides[active]
  useEffect(() => { const t = window.setInterval(() => setActive(v => (v + 1) % slides.length), 6500); return () => window.clearInterval(t) }, [])

  return <main className="immersiveTravel">
    <div className="immersiveTop"><span><Sparkles size={12}/> HAJI TRAVEL OS</span><span>INDONESIA · MAKKAH · MADINAH</span></div>
    <header className="immersiveNav">
      <Link href="#top" className="brandMark"><b>HAJI</b><span>TRAVEL OS</span></Link>
      <nav><Link href="#programs">Program</Link><Link href="#experience">Pengalaman</Link><Link href="#story">Alur perjalanan</Link><Link href="/faq">FAQ</Link></nav>
      <Link href="/inquire" className="navAction">Rencanakan perjalanan <ArrowRight size={15}/></Link>
      
    </header>
    <section id="top" className="immersiveHero">
      <div className={'heroScene scene-' + slide.scene} key={slide.scene} style={{"--hero-photo": `url(${slide.photo})`} as CSSProperties}>
        <div className="scenePhoto"/><div className="sceneSky"/><div className="sceneMoon"/><div className="sceneGlow"/>
        <div className="sceneMosque"><i/><i/><i/><i/><b/></div><div className="sceneHorizon"/>
        <div className="sceneStars"><i/><i/><i/><i/><i/><i/><i/></div>
      </div>
      <div className="heroShade"/>
      <div className="heroIndex"><b>0{active + 1}</b><span>/ 03</span></div>
      <div className="heroCopy">
        <div className="heroKicker"><span/>{slide.kicker}</div>
        <h1>{slide.title}</h1>
        <p>{slide.text}</p>
        <div className="heroActions"><Link href="/packages" className="heroPrimary">Jelajahi program <ArrowRight size={16}/></Link><Link href="/inquire" className="heroSecondary">Konsultasi dengan tim perjalanan</Link></div>
      </div>
      <div className="heroPlace"><small>{slide.note}</small><strong>{slide.place}</strong><div className="placeLine"/></div>
      <div className="heroDots">{slides.map((_,i)=><button key={i} aria-label={'Slide '+(i+1)} className={i===active?'active':''} onClick={()=>setActive(i)}/>)}</div>
      <a href="#intro" className="heroScroll"><span>GULIR UNTUK MENJELAJAH</span><ArrowDownRight size={18}/></a>
    </section>

    <section id="intro" className="editorialIntro">
      <div className="introNumber">01</div><div><span className="eyebrow">PLATFORM PERJALANAN YANG BERBEDA</span><h2>Bukan sekadar paket.<br/><em>Sebuah perjalanan yang utuh.</em></h2></div>
      <p>HAJI TRAVEL OS mempertemukan pengalaman publik dengan operating system di belakangnya. Informasi yang tampil mengikuti data yang benar-benar diterbitkan—tanpa angka, jadwal, atau klaim yang dibuat-buat.</p>
    </section>

    <section id="programs" className="journeyCollection">
      <div className="collectionHead"><div><span className="eyebrow">02 · KOLEKSI PERJALANAN</span><h2>Pilih<br/><em>perjalanan Anda.</em></h2></div><Link href="/packages">Lihat semua program <ArrowRight size={15}/></Link></div>
      <div className="catalogStage"><PublicCatalog/></div>
    </section>

    <section id="experience" className="immersiveSplit">
      <div className="splitVisual"><div className="splitPhoto"/><div className="verticalWord">EXPERIENCE</div><div className="goldOrb"/><div className="archLight"/><div className="silhouette"><i/><i/><i/><i/></div></div>
      <div className="splitCopy"><span className="eyebrow">03 · LEBIH DARI BOOKING</span><h2>Tenang karena tahu<br/><em>apa yang berikutnya.</em></h2><p>Jamaah melihat perjalanan yang sederhana. Tim operasional melihat readiness, dokumen, pembayaran, itinerary, departure, dan inquiry dalam satu alur yang terkontrol.</p><div className="statRail"><div><b>01</b><span>Perencanaan perjalanan</span></div><div><b>02</b><span>Visibilitas operasional</span></div><div><b>03</b><span>Akses terkontrol</span></div></div><Link href="/inquire" className="lineCta">Mulai konsultasi <ArrowRight size={15}/></Link></div>
    </section>

    <section id="story" className="storySection">
      <div className="storyHead"><span className="eyebrow">04 · ALUR PERJALANAN</span><h2>Dari niat pertama<br/><em>hingga kembali pulang.</em></h2></div>
      <div className="storyRail"><div className="storyItem"><b>01</b><h3>Niat</h3><p>Konsultasi dan pilih arah perjalanan yang sesuai kebutuhan.</p></div><div className="storyItem"><b>02</b><h3>Persiapan</h3><p>Data, dokumen, persyaratan, itinerary, dan readiness disusun.</p></div><div className="storyItem"><b>03</b><h3>Perjalanan</h3><p>Operasional mengawal perjalanan dan informasi keberangkatan.</p></div><div className="storyItem"><b>04</b><h3>Kembali</h3><p>Perjalanan selesai, data dan tindak lanjut tetap tercatat.</p></div></div>
    </section>

    <section className="manifesto"><div className="manifestoMark"><Compass size={24}/><span>HAJI TRAVEL OS</span></div><h2>Dirancang untuk ibadah.<br/><em>Dibangun dengan kejelasan.</em></h2><p>Satu pengalaman di depan. Satu operating system di belakang.</p><div className="manifestoActions"><Link href="/inquire" className="heroPrimary">Rencanakan perjalanan <ArrowRight size={16}/></Link><Link href="/faq" className="heroSecondary">Lihat FAQ</Link></div></section>

    <footer className="immersiveFooter"><div><b>HAJI TRAVEL OS</b><span>Sistem operasi perjalanan Haji & Umrah.</span></div><div className="footerNav"><Link href="/packages">Program</Link><Link href="/inquire">Konsultasi</Link><Link href="/login">Portal</Link></div><small>© 2026</small></footer>
  </main>
}

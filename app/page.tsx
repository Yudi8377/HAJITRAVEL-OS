import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, Plane, Users, WalletCards, FileCheck2, Hotel, Headphones, MapPinned } from 'lucide-react'
import { HaajiLogo } from '../src/components/HaajiLogo'
import type { LucideIcon } from 'lucide-react'

const services: Array<[string, string, LucideIcon]> = [
  ['Jamaah', 'Profil, dokumen, visa, consent, pembayaran, dan readiness dalam satu data.', Users],
  ['Paket Haji & Umrah', 'Susun paket, periode keberangkatan, hotel, penerbangan, transport, dan layanan.', Plane],
  ['Finance', 'Invoice, pembayaran, rekonsiliasi, outstanding, dan approval yang terkontrol.', WalletCards],
  ['Compliance', 'Requirement, evidence, review, incident, dan audit trail terhubung.', FileCheck2],
]

const journeys = [
  ['01', 'Daftar', 'Jamaah memilih paket dan memulai proses pendaftaran.'],
  ['02', 'Verifikasi', 'Dokumen, data, pembayaran, dan persyaratan diperiksa.'],
  ['03', 'Persiapan', 'Hotel, flight, transport, group, briefing, dan checklist disiapkan.'],
  ['04', 'Berangkat', 'Tim operasi memantau readiness sampai jamaah kembali.'],
]

export default function PublicHome() {
  return <main className="publicSite">
    <nav className="publicNav">
      <HaajiLogo light />
      <div className="publicLinks">
        <a href="#paket">Paket</a><a href="#layanan">Layanan</a><a href="#alur">Alur</a><a href="#kontak">Kontak</a>
        <Link href="/login" className="navLogin">Masuk <ArrowRight size={15}/></Link>
      </div>
    </nav>

    <section className="hero travelHero">
      <div className="heroDecor heroDecorOne"/><div className="heroDecor heroDecorTwo"/>
      <div className="heroCopy">
        <div className="pill"><span/> HAJI & UMRAH · TRUSTED JOURNEY</div>
        <h1>Berangkat dengan tenang.<br/><em>Beribadah dengan khusyuk.</em></h1>
        <p>HAJI TRAVEL OS menghadirkan pengalaman perjalanan Haji & Umrah yang rapi, transparan, dan terkontrol — dari konsultasi, pendaftaran, persiapan, keberangkatan hingga kepulangan.</p>
        <div className="heroActions"><Link href="#paket" className="primaryCta">Jelajahi perjalanan <ArrowRight size={17}/></Link><Link href="/login" className="secondaryCta">Portal Jamaah / Admin</Link></div>
        <div className="heroTrust"><ShieldCheck size={18}/><span>Data terkontrol · Tim operasional · Pendampingan end-to-end</span></div>
      </div>
      <div className="heroPanel">
        <div className="heroPanelTop"><span>YOUR JOURNEY</span><b>1448 H</b></div>
        <div className="kaabaArt"><div className="kaabaCube"><i/><span>الكعبة</span></div><div className="orbit orbitA"/><div className="orbit orbitB"/></div>
        <div className="heroPanelBottom"><div><small>JOURNEY STATUS</small><b>Ready when you are</b></div><CheckCircle2 size={20}/></div>
      </div>
    </section>

    <section className="statStrip"><div><b>01</b><span>Personal service</span></div><div><b>02</b><span>Clear itinerary</span></div><div><b>03</b><span>Controlled operations</span></div><div><b>04</b><span>Secure data</span></div></section>

    <section id="paket" className="section packageSection">
      <div className="sectionHead"><div><span className="eyebrowLight">JOURNEY COLLECTION</span><h2>Pilih perjalanan yang<br/><em>sesuai kebutuhan.</em></h2></div><p>Landing page Travel Haji & Umrah yang elegan untuk calon jamaah dan tetap terhubung dengan operating system internal.</p></div>
      <div className="packageGrid">
        <article className="packageCard featured"><span className="packageTag">MOST COMPLETE</span><h3>Haji Reguler</h3><p>Program terstruktur dengan pendampingan persiapan, akomodasi, transportasi, dan layanan jamaah.</p><div><b>Full Journey</b><span>Consultation · Preparation · Departure</span></div><Link href="/login">Konsultasi paket <ArrowRight size={15}/></Link></article>
        <article className="packageCard"><span className="packageTag">UMRAH</span><h3>Umrah Premium</h3><p>Pengalaman Umrah nyaman dengan pilihan hotel, jadwal, dan layanan yang dapat disesuaikan.</p><div><b>Comfort Journey</b><span>Hotel · Flight · Ground Service</span></div><Link href="/login">Tanya lebih lanjut <ArrowRight size={15}/></Link></article>
        <article className="packageCard"><span className="packageTag">FAMILY</span><h3>Private Family</h3><p>Perjalanan personal untuk keluarga, komunitas, atau rombongan khusus.</p><div><b>Tailored Journey</b><span>Private Group · Dedicated Support</span></div><Link href="/login">Buat perjalanan <ArrowRight size={15}/></Link></article>
      </div>
    </section>

    <section id="layanan" className="section servicesSection">
      <div className="sectionHead"><div><span className="eyebrowLight">OUR SERVICES</span><h2>Satu tim.<br/><em>Satu perjalanan.</em></h2></div><p>Di belakang pengalaman jamaah ada sistem operasi yang menjaga setiap detail tetap terlihat dan dapat ditindaklanjuti.</p></div>
      <div className="serviceGrid">{services.map(([title, desc, Icon], i) => <div className="serviceCard" key={String(title)}><div className="serviceIcon"><Icon size={21}/></div><span>0{i+1}</span><h3>{title}</h3><p>{desc}</p><ArrowRight size={18}/></div>)}</div>
    </section>

    <section id="alur" className="workflow"><div className="workflowInner"><div><span className="eyebrowLight">THE JOURNEY</span><h2>Dari niat menjadi<br/><em>perjalanan nyata.</em></h2><p>Setiap tahap memiliki owner, checklist, status, dan evidence sehingga jamaah dan tim travel tahu apa yang harus dilakukan berikutnya.</p></div><div className="flowList">{journeys.map(x => <div className="flowItem" key={x[0]}><b>{x[0]}</b><div><strong>{x[1]}</strong><span>{x[2]}</span></div><CheckCircle2 size={18}/></div>)}</div></div></section>

    <section className="experienceSection"><div className="experienceIntro"><span className="eyebrow">WHY HAJI TRAVEL OS</span><h2>Lebih dari booking.<br/><em>Ini perjalanan yang dijaga.</em></h2></div><div className="experienceGrid"><div><Hotel/><b>Akomodasi terencana</b><span>Hotel dan service tersusun dalam itinerary.</span></div><div><MapPinned/><b>Ground handling</b><span>Transport dan layanan lapangan terkoordinasi.</span></div><div><Headphones/><b>Dedicated support</b><span>Tim siap mendampingi jamaah sepanjang perjalanan.</span></div><div><ShieldCheck/><b>Secure operations</b><span>Data dan akses internal dikelola dengan kontrol berlapis.</span></div></div></section>

    <section id="kontak" className="ctaSection"><div><span className="eyebrow">START YOUR JOURNEY</span><h2>Siap memulai perjalanan<br/><em>ke Tanah Suci?</em></h2><p>Hubungi tim kami untuk konsultasi paket dan kebutuhan perjalanan Anda.</p></div><div className="ctaActions"><Link href="/login" className="primaryCta">Masuk Portal <ArrowRight size={17}/></Link><a href="mailto:info@hajitravel.id" className="secondaryCta">Hubungi Travel</a></div></section>

    <footer className="publicFooter"><HaajiLogo/><span>HAJI TRAVEL OS · Hajj & Umrah travel operating system.</span><Link href="/login">Admin Portal →</Link></footer>
  </main>
}
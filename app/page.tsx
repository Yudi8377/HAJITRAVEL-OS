import Link from 'next/link'
import {
  ArrowRight, Check, ChevronRight, Clock3, Compass, FileCheck2, Hotel,
  MapPinned, Menu, Plane, ShieldCheck, Sparkles, Users, WalletCards
} from 'lucide-react'
import { HaajiLogo } from '../src/components/HaajiLogo'
import type { LucideIcon } from 'lucide-react'

const packages = [
  { tag:'UMRAH', title:'Umrah Premium', days:'12 Hari', desc:'Perjalanan nyaman dengan akomodasi terpilih, pendampingan ibadah, dan ground service terkoordinasi.', meta:'Makkah · Madinah', featured:true },
  { tag:'HAJI', title:'Haji Reguler', days:'Program Musiman', desc:'Perjalanan Haji dengan alur persiapan, dokumen, akomodasi, transportasi, dan monitoring yang terstruktur.', meta:'Makkah · Madinah · Masyair' },
  { tag:'PRIVATE', title:'Private Family', days:'Custom', desc:'Rancang perjalanan keluarga atau grup khusus dengan itinerary dan layanan yang disesuaikan.', meta:'Tailored Journey' },
]

const services: Array<[string,string,LucideIcon]> = [
  ['Jamaah','Profil, dokumen, visa, consent, pembayaran, dan readiness.',Users],
  ['Paket perjalanan','Flight, hotel, transport, itinerary, dan layanan dalam satu alur.',Plane],
  ['Finance','Invoice, pembayaran, rekonsiliasi, outstanding, dan approval.',WalletCards],
  ['Compliance','Requirement, evidence, review, incident, dan audit trail.',FileCheck2],
]

const journey = [
  ['01','Konsultasi','Pilih kebutuhan perjalanan dan diskusikan program.'],
  ['02','Pendaftaran','Lengkapi data, dokumen, dan persyaratan jamaah.'],
  ['03','Persiapan','Tim mengawal itinerary, hotel, flight, transport, dan briefing.'],
  ['04','Perjalanan','Operasional memonitor perjalanan sampai kepulangan.'],
]

function Ornament() {
  return <div className="sacredOrnament" aria-hidden="true"><span/><span/><span/></div>
}

export default function PublicHome() {
  return <main className="premiumTravel">
    <div className="topNotice"><span><Sparkles size={13}/> Premium Hajj & Umrah Journey</span><span className="topNoticeRight">Indonesia · Makkah · Madinah</span></div>

    <nav className="premiumNav">
      <HaajiLogo light />
      <div className="premiumLinks">
        <Link href="/packages">Program</Link>
        <a href="#experience">Experience</a>
        <a href="#process">Alur</a>
        <Link href="/inquire">Kontak</Link>
        <Link href="/login" className="premiumNavCta">Portal <ArrowRight size={15}/></Link>
      </div>
      <button className="mobileMenu" aria-label="Menu"><Menu size={21}/></button>
    </nav>

    <section className="premiumHero">
      <div className="heroTexture"/>
      <div className="heroOrb heroOrbOne"/>
      <div className="heroOrb heroOrbTwo"/>
      <div className="premiumHeroCopy">
        <div className="premiumEyebrow"><span/> JOURNEY WITH PURPOSE</div>
        <h1>Your sacred journey,<br/><em>beautifully arranged.</em></h1>
        <p>Perjalanan Haji & Umrah yang dirancang dengan perhatian pada setiap detail — dari niat pertama hingga kembali ke rumah.</p>
        <div className="heroButtons">
          <a href="/packages" className="goldButton">Explore journeys <ArrowRight size={16}/></a>
          <a href="/inquire" className="ghostButton">Talk to our journey team</a>
        </div>
        <div className="heroAssurance"><ShieldCheck size={17}/><span>Structured operations · Clear journey · Dedicated support</span></div>
      </div>

      <div className="heroVisual" aria-label="Premium Hajj and Umrah visual">
        <div className="visualFrame">
          <div className="visualTop"><span>HAJI TRAVEL OS</span><b>1448 H</b></div>
          <div className="visualScene">
            <div className="moon"/>
            <div className="minaret minaretOne"><i/></div>
            <div className="minaret minaretTwo"><i/></div>
            <div className="mosqueRoof"><span/><span/><span/><span/><span/></div>
            <div className="kaabaPremium"><b>الكعبة</b><i/></div>
            <div className="lightRing"/>
          </div>
          <div className="visualCaption"><div><small>NEXT DESTINATION</small><strong>Makkah Al-Mukarramah</strong></div><Compass size={20}/></div>
        </div>
        <div className="floatingCard floatingCardTop"><Sparkles size={16}/><div><small>CURATED</small><b>Journey planning</b></div></div>
        <div className="floatingCard floatingCardBottom"><Check size={16}/><div><small>READY</small><b>Every detail considered</b></div></div>
      </div>
    </section>

    <div className="quickSearch">
      <div><small>JOURNEY TYPE</small><b>Hajj & Umrah</b></div>
      <div><small>DESTINATION</small><b>Makkah & Madinah</b></div>
      <div><small>TRIP STYLE</small><b>Premium experience</b></div>
      <Link href="/packages" className="searchButton"><span>Explore</span><ArrowRight size={17}/></Link>
    </div>

    <section className="trustRow">
      <div><ShieldCheck/><b>Secure operations</b><span>Data & access controlled</span></div>
      <div><Hotel/><b>Curated stays</b><span>Accommodation planned</span></div>
      <div><MapPinned/><b>Ground support</b><span>Journey coordinated</span></div>
      <div><Clock3/><b>Dedicated care</b><span>Support throughout</span></div>
    </section>

    <section id="program" className="premiumSection programSection">
      <div className="premiumSectionHead"><div><span className="sectionKicker">THE JOURNEY COLLECTION</span><h2>Find the journey<br/><em>that feels right.</em></h2></div><p>Program ditampilkan sebagai pengalaman, bukan sekadar daftar paket. Detail final dapat dikelola tim travel melalui operating system.</p></div>
      <div className="programGrid">{packages.map((item,index)=><article className={item.featured?'programCard programFeatured':'programCard'} key={item.title}>
        <div className="programImage"><span>{item.tag}</span><b>0{index+1}</b><Ornament/><div className="programImageLabel">{item.title}</div></div>
        <div className="programBody"><div className="programMeta"><span>{item.days}</span><span>{item.meta}</span></div><h3>{item.title}</h3><p>{item.desc}</p><Link href="/packages">Explore journey <ChevronRight size={15}/></Link></div>
      </article>)}</div>
    </section>

    <section id="experience" className="experienceBand">
      <div className="experienceVisual"><div className="archWindow"><div className="archMoon"/><div className="archCity"><i/><i/><i/><i/><i/><i/></div><div className="archStar s1"/><div className="archStar s2"/><div className="archStar s3"/></div></div>
      <div className="experienceCopy"><span className="sectionKicker">MORE THAN A BOOKING</span><h2>A journey designed<br/><em>around your peace.</em></h2><p>HAJI TRAVEL OS menghubungkan pengalaman jamaah dengan operasi di belakang layar. Tim dapat melihat readiness, dokumen, pembayaran, itinerary, dan kebutuhan layanan dalam satu alur.</p><div className="experiencePoints"><div><b>01</b><span>Personal journey planning</span></div><div><b>02</b><span>Clear operational visibility</span></div><div><b>03</b><span>Controlled data & access</span></div></div><a href="#process" className="textLink">See how the journey works <ArrowRight size={15}/></a></div>
    </section>

    <section id="process" className="premiumSection processSection">
      <div className="premiumSectionHead"><div><span className="sectionKicker">YOUR JOURNEY</span><h2>From intention<br/><em>to arrival.</em></h2></div><p>Alur sederhana di sisi jamaah, dengan kontrol yang lebih dalam di sisi operasional.</p></div>
      <div className="journeyGrid">{journey.map(([no,title,desc])=><div className="journeyStep" key={no}><span>{no}</span><div><h3>{title}</h3><p>{desc}</p></div><ArrowRight size={18}/></div>)}</div>
    </section>

    <section className="serviceBand"><div className="serviceBandHead"><span className="sectionKicker">ONE OPERATING SYSTEM</span><h2>Every detail,<br/><em>connected.</em></h2><p>Di balik pengalaman premium, ada sistem yang menjaga data, finance, compliance, dan operasi tetap terhubung.</p></div><div className="serviceList">{services.map(([title,desc,Icon],i)=><div className="serviceRow" key={title}><span>0{i+1}</span><Icon size={21}/><div><b>{title}</b><p>{desc}</p></div><ArrowRight size={17}/></div>)}</div></section>

    <section id="contact" className="premiumCta"><div className="ctaGlow"/><span className="sectionKicker">BEGIN YOUR JOURNEY</span><h2>Ready for a more<br/><em>meaningful journey?</em></h2><p>Mulai dengan konsultasi. Tim kami membantu menerjemahkan kebutuhan Anda menjadi perjalanan yang terencana.</p><div className="ctaButtons"><Link href="/inquire" className="goldButton">Start consultation <ArrowRight size={16}/></Link><Link href="/inquire" className="ghostButton">Contact journey team</Link></div></section>

    <footer className="premiumFooter"><div><HaajiLogo/><p>Hajj & Umrah travel operating system.</p></div><div className="footerLinks"><Link href="/packages">Programs</Link><a href="#experience">Experience</a><a href="#process">Journey</a><Link href="/login">Portal</Link></div><span>© 2026 HAJI TRAVEL OS</span></footer>
  </main>
}

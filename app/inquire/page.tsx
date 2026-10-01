import Link from 'next/link'
import { ArrowLeft,ShieldCheck } from 'lucide-react'
import InquiryForm from './InquiryForm'
export const dynamic='force-dynamic'
export default async function InquirePage({searchParams}:{searchParams:Promise<{package?:string;departure?:string;intent?:string}>}){
  const params=await searchParams
  const intent=params.intent==='BOOKING_REQUEST'?'BOOKING_REQUEST':'CONSULTATION'
  return <main className="inquiryPage"><div className="inquiryShell"><Link href="/" className="detailBack"><ArrowLeft size={15}/> Kembali ke website</Link><div className="inquiryHeader"><span className="sectionKicker">BEGIN YOUR JOURNEY</span><h1>Tell us what your<br/><em>journey needs.</em></h1><p>Mulai dari kebutuhan sederhana sampai perjalanan keluarga atau grup. Inquiry ini masuk ke operating system untuk ditindaklanjuti tim.</p></div><div className="inquiryCard"><div className="inquiryCardHead"><div><b>{intent==='BOOKING_REQUEST'?'Booking request':'Journey consultation'}</b><span>Formulir permintaan publik</span></div><ShieldCheck size={20}/></div><InquiryForm initialIntent={intent} initialPackageId={params.package} initialDepartureId={params.departure}/></div></div></main>
}
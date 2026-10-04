import './globals.css'
import './form-polish.css'
import type { Metadata } from 'next'
export const metadata: Metadata={title:'HAJITRAVEL OS — Control Center',description:'Digital operating system untuk perjalanan Haji dan Umrah yang aman, terstruktur, dan terkontrol.',applicationName:'HAJITRAVEL OS',icons:{icon:'/icon.svg'},openGraph:{title:'HAJITRAVEL OS',description:'Premium Hajj & Umrah operating system',type:'website'}}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}
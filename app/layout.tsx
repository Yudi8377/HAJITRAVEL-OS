import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata={title:'HAJI TRAVEL OS',description:'Digital operating system untuk perjalanan Haji dan Umrah yang aman, terstruktur, dan terkontrol.'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}
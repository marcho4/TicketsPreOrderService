import '@/styles/globals.css'
import { Inter, Montserrat } from 'next/font/google'
import { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

const montserrat = Montserrat({
    weight: ['400', '700', '600'],
    subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ticket Preorder Platform',
  description: 'Preorder tickets for your favorite events',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.className}`}>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
              {children}
              <Toaster/>
              {/* <Footer /> */}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}



import './global.css'
import {AuthProvider} from "@/providers/authProvider";
import {Toaster} from "@/components/ui/toaster";

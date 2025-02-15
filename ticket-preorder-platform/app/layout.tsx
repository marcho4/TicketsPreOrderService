import '@/styles/globals.css'
import { Inter, Montserrat } from 'next/font/google'
import { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'

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
      <body className={`${montserrat.className} bg-background text-text`}>
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen pt-8">
              {children}
              <Toaster/>
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'
import {AuthProvider} from "@/providers/authProvider";
import {Toaster} from "@/components/ui/toaster";
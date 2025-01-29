import '@/styles/globals.css'
import { Inter, Roboto } from 'next/font/google'
import { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })
// const roboto = Roboto({
//     weight: ["400", "500", "700", "900"],
// })

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
      <body className={`${inter.className} bg-background text-text`}
            style={{
              backgroundImage: 'url("/futuristic-background.jpg")',
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed'
            }}>
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
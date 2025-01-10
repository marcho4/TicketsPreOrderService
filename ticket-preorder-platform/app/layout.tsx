import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

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
        <Navigation />
        <main className="min-h-screen pt-8">
          {children}
        </main>
      </body>
    </html>
  )
}



import './globals.css'
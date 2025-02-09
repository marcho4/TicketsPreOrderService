"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  const logout = () => {
    try {
      fetch('http://localhost:8000/api/auth/logout', {method: 'POST', credentials: 'include'})
      window.location.reload()
    } catch  {
      console.error('logout failed')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 bg-accent lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 bg-accent">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4 gap-10">
              <h2 className="text-2xl font-semibold mb-4">Your Upcoming Events</h2>
              <p className="text-gray-600">You have no upcoming events.</p>
              <Link href="/" passHref>
                <Button className="mt-4 bg-button-secondary">Browse Events</Button>
              </Link>
              <Button onClick={logout} className="bg-button-secondary">Logout</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


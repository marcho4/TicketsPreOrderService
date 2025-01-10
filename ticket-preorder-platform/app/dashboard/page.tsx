import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
              <h2 className="text-2xl font-semibold mb-4">Your Upcoming Events</h2>
              <p className="text-gray-600">You have no upcoming events.</p>
              <Link href="/events" passHref>
                <Button className="mt-4">Browse Events</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


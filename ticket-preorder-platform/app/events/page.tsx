import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const events = [
  { id: 1, title: 'Summer Music Festival', date: '2023-07-15', image: '/placeholder.svg' },
  { id: 2, title: 'Comedy Night', date: '2023-07-22', image: '/placeholder.svg' },
  { id: 3, title: 'Tech Conference 2023', date: '2023-08-05', image: '/placeholder.svg' },
]

export default function Events() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover mb-4" />
              <p className="text-gray-600">Date: {event.date}</p>
            </CardContent>
            <CardFooter>
              <Button>Preorder Tickets</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


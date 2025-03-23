import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'


export default function Home() {
  return (
    <div className="container mx-auto px-8 md:px-12 lg:px-16">
      <h1 className="text-4xl font-bold mb-6 text-center text-text">Welcome to Ticket Preorder Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* {events.map((event) => (
          <Card key={event.id} className="bg-background border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 hover:scale-105">
            <CardHeader>
              <CardTitle className="text-text text-xl font-bold">{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover mb-4 rounded-md" />
              <p className="text-text text-sm">Date: {event.date}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary text-background hover:bg-[#46d1fb] hover:text-background transition-colors duration-300">Preorder Tickets</Button>
            </CardFooter>
          </Card>
        ))} */}
      </div>
    </div>
  )
}


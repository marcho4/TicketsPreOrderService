'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the login logic
    console.log('Login attempt', { email, password })
    // For now, we'll just redirect to the dashboard
    router.push('/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background bg-opacity-80" 
         style={{
           backgroundImage: 'url("/placeholder.svg?height=1080&width=1920")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}>
      <Card className="w-full max-w-md bg-background bg-opacity-90 rounded-3xl shadow-2xl">
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-3xl font-bold text-center text-text">Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6 pb-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-text">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl bg-secondary text-text placeholder:text-text/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-text">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl bg-secondary text-text placeholder:text-text/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <Button type="submit" className="w-full rounded-xl">Login</Button>
            <p className="text-sm text-center text-text">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:underline">Sign up</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


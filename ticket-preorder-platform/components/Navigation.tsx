'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/login', label: 'Login' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-background py-4">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-center">
          <div className="bg-secondary rounded-full px-4 py-2">
            <div className="flex items-center space-x-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300',
                    pathname === link.href
                      ? 'bg-primary text-background hover:bg-[#46d1fb]'
                      : 'text-text hover:bg-[#46d1fb] hover:text-background'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}


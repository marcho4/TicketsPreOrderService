'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/authProvider'

const links = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { href: '/login', label: 'Login' },
]

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Фильтруем ссылки на основе наличия пользователя
  const filteredLinks = links.filter(link => !(link.requiresAuth && !user))

  return (
      <nav className="bg-background py-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-[#333333] rounded-full px-4 py-2">
              <div className="flex items-center space-x-4">
                {filteredLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            'px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300 ',
                            pathname === link.href
                                ? 'bg-accent text-my_black '
                                : 'text-[#ffffff] hover:bg-my_black '
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
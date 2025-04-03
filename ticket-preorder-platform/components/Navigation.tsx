'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/authProvider'
import { UserRole } from '@/enums/user-role'
import { useState, useMemo } from 'react'
import { Menu, X } from 'lucide-react'

const getLinksForRole = (role: string) => {
    const commonLinks = [
        { href: '/', label: 'Главная' },
        { href: '/matches', label: 'Матчи' },
    ]

    switch (role) {
        case 'ADMIN':
            return [...commonLinks, { href: '/admin', label: 'Админ' }]
        case 'ORGANIZER':
            return [...commonLinks, { href: '/organizer', label: 'Личный кабинет' }]
        case 'USER':
            return [...commonLinks, { href: '/dashboard', label: 'Личный кабинет' }]
        case UserRole.NotAuthorized:
        default:
            return [...commonLinks, { href: '/login', label: 'Войти' }]
    }
}

export function Navigation() {
    const pathname = usePathname()
    const { userRole  } = useAuth()
    const [isOpen, setIsOpen] = useState(false)

    const links = useMemo(() => getLinksForRole(userRole), [userRole])

    return (
        <nav className="bg-background/50 backdrop-blur-xl py-2 border-b border-gray-200 sticky top-0 inset-x-0 z-40 w-full">
            <header className="relative w-full mx-auto h-10 flex items-center z-20">
                <div className="absolute px-2 md:px-10 z-30">
                    <Link href="/" className="text-xl font-semibold text-black">
                        TicketsPreOrder
                    </Link>
                </div>

                <div className="w-full justify-center hidden md:flex">
                    <div className="bg-white/70 rounded-full px-4 py-2 border border-gray-300 backdrop-blur-lg shadow-lg z-30">
                        <div className="flex items-center space-x-4">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'px-3 rounded-full text-sm font-medium transition-colors duration-300',
                                        pathname === link.href
                                            ? 'font-semibold text-my_black hover:text-my_black/80 scale-105 transition-all duration-300'
                                            : 'text-my_black hover:text-gray-500'
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="absolute right-4 md:hidden z-30">
                    <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
                        {isOpen ? (
                            <X className="w-6 h-6 text-black" />
                        ) : (
                            <Menu className="w-6 h-6 text-black" />
                        )}
                    </button>
                </div>
            </header>

            <div
                className={cn(
                    'fixed top-0 left-0 w-full h-screen z-50 flex flex-col transition-transform duration-300 ease-in-out',
                    isOpen ? 'translate-y-0' : '-translate-y-full'
                )}
            >
                <div className="absolute inset-0"
                    onClick={() => setIsOpen(false)}
                />

                <div className="relative w-full mx-auto bg-white p-4 rounded-lg shadow-lg flex flex-col items-center space-y-6">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                'text-xl font-medium transition-colors duration-300',
                                pathname === link.href
                                    ? 'font-semibold text-my_black hover:text-my_black/80 scale-105'
                                    : 'text-my_black hover:text-gray-500'
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    )
}
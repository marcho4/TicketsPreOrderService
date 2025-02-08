'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/authProvider'
import { UserRole } from '@/enums/user-role';
import {useEffect} from "react";

const getLinksForRole = (role: string) => {
    const commonLinks = [
        { href: '/', label: 'Home' },
        { href: '/matches', label: 'Matches' },
    ];

    switch (role) {
        case "ADMIN":
            return [
                ...commonLinks,
                { href: '/admin', label: 'Admin Panel' },
            ];
        case "ORGANIZER":
            return [
                ...commonLinks,
                { href: '/organizer', label: 'Dashboard' },
            ];
        case "USER":
            return [
                ...commonLinks,
                { href: '/dashboard', label: 'Dashboard' },
            ];
        case UserRole.NotAuthorized:
        default:
            return [
                ...commonLinks,
                { href: '/login', label: 'Login' },
            ];
    }
};

export function Navigation() {
    const pathname = usePathname();
    const { userRole } = useAuth();
    useEffect(() => {
        links = getLinksForRole(userRole);
    }, [userRole])

    let links = getLinksForRole(userRole);

    return (
        <nav className="bg-background/50 backdrop-blur-3xl py-2 border-b border-gray-200 sticky top-0 inset-x-0 z-40 w-full">
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
            </header>
        </nav>
    );
}
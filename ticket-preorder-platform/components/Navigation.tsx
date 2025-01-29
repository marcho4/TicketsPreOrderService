'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/authProvider'
import { UserRole } from '@/enums/user-role';

const getLinksForRole = (role: string) => {
    const currentRole = role;

    const commonLinks = [
        { href: '/', label: 'Home' },
        { href: '/events', label: 'Events' },
    ];

  switch (role) {
      case "ADMIN":
          return [
              ...commonLinks,
              { href: '/admin-home', label: 'Admin Panel' },
              { href: '/dashboard', label: 'Dashboard' },
              // { href: '/logout', label: 'Logout' },
          ];
      case "ORGANIZER":
          return [
              ...commonLinks,
              { href: '/organizer', label: 'Dashboard' },
              { href: '/create-event', label: 'Create Event' },
              { href: '/logout', label: 'Logout' },
          ];
      case "USER":
          return [
              ...commonLinks,
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/my-tickets', label: 'My Tickets' },
              { href: '/logout', label: 'Logout' },
          ];
      case UserRole.NotAuthorized:
      default:
          return [
              { href: '/', label: 'Main Page' },
              { href: '/login', label: 'Login' },
              { href: '/organizer', label: 'Organizer Dashboard' },
              { href: '/user', label: 'User Dashboard' }
          ];
  }
};

export function Navigation() {
  const pathname = usePathname();
  const { userRole } = useAuth();
  
  const links = getLinksForRole(userRole);

  return (
      <nav className="bg-background py-4">
          <div className="max-w-3xl mx-auto px-4">
              <div className="flex justify-center">
                  <div className="bg-[#333333] rounded-full px-4 py-2">
                      <div className="flex items-center space-x-4">
                          {links.map((link) => (
                              <Link
                                  key={link.href}
                                  href={link.href}
                                  className={cn(
                                      'px-3 py-2 rounded-full text-sm font-medium transition-colors duration-300',
                                      pathname === link.href
                                          ? 'bg-accent text-my_black'
                                          : 'text-[#ffffff] hover:bg-my_black'
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
  );
}
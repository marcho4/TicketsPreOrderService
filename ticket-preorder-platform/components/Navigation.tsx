'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/authProvider'
import { UserRole } from '@/enums/user-role';

const getLinksForRole = (role: UserRole) => {

  const currentRole = role ?? UserRole.NotAuthorized;
  const commonLinks = [
      { href: '/', label: 'Home' },
      { href: '/events', label: 'Events' },
  ];

  switch (role) {
      case UserRole.Admin:
          return [
              ...commonLinks,
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/admin', label: 'Admin Panel' },
              { href: '/logout', label: 'Logout' },
          ];
      case UserRole.Organizer:
          return [
              ...commonLinks,
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/create-event', label: 'Create Event' },
              { href: '/logout', label: 'Logout' },
          ];
      case UserRole.User:
          return [
              ...commonLinks,
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/my-tickets', label: 'My Tickets' },
              { href: '/logout', label: 'Logout' },
          ];
      case UserRole.NotAuthorized:
      default:
          return [
              { href: '/login', label: 'Login' },
              // для теста админа
              { href: '/admin-home', label: 'AdminHome'},
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
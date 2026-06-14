'use client';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Music, Users, ListMusic, Bell, LayoutDashboard, LogOut } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/songs', label: 'Songs', icon: Music },
  { href: '/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/' || pathname === '/login';

  if (isLogin) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-[#111] border-r border-[#222] flex flex-col shrink-0">
          <div className="p-5 border-b border-[#222]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#6C63FF] flex items-center justify-center">
                <Music size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">NOX Admin</p>
                <p className="text-gray-500 text-xs">Control Panel</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  pathname === href
                    ? 'bg-[#6C63FF] text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-[#222]">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut size={16} />
              Logout
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-[#0A0A0A]">
          {children}
        </main>
      </body>
    </html>
  );
}

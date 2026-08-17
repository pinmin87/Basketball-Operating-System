'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, BookOpen, ClipboardCheck, Wallet } from 'lucide-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays },
    { name: 'Classes', href: '/classes', icon: BookOpen },
    { name: 'Attendance', href: '/attendance', icon: ClipboardCheck },
    { name: 'Fees', href: '/fees', icon: Wallet },
  ];

  return (
    <html lang="en">
      <body className="bg-gray-200 text-gray-900 selection:bg-blue-200">
        {/* App 模拟器外壳：保证在电脑上居中，在手机上满屏 */}
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-2xl relative overflow-x-hidden flex flex-col">
          
          {/* 主内容区，底部留出空间给导航栏 */}
          <div className="flex-1 pb-24">
            {children}
          </div>

          {/* 纯正 App 质感的底部导航栏 */}
          <nav className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-lg border-t border-gray-200 flex justify-between items-center px-4 pt-3 pb-safe z-50 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-16 active:scale-90 transition-transform">
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
          
        </div>
      </body>
    </html>
  );
}
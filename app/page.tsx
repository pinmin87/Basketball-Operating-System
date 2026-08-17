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
        <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-2xl relative overflow-x-hidden flex flex-col">
          
          {/* 主内容区，增加 pb-28 确保最底部的列表不会被导航栏遮挡 */}
          <div className="flex-1 pb-28">
            {children}
          </div>

          {/* 底部导航栏：升级了 iOS 级毛玻璃，增加了 pb-8 完美避开 iPhone 底部横线 */}
          <nav className="fixed bottom-0 w-full max-w-md bg-white/85 backdrop-blur-xl border-t border-gray-200/50 flex justify-between items-center px-3 pt-2.5 pb-8 z-50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-16 active:scale-90 transition-transform">
                  <div className={`p-1.5 rounded-2xl transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] mt-1.5 font-bold tracking-wide ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
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
'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, BookOpen, ClipboardCheck, Wallet } from 'lucide-react';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';
    document.body.style.height = 'auto';
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays },
    { name: 'Classes', href: '/classes', icon: BookOpen },
    { name: 'Attendance', href: '/attendance', icon: ClipboardCheck },
    { name: 'Fees', href: '/fees', icon: Wallet },
  ];

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-gray-200 text-gray-900 sm:flex sm:justify-center antialiased">
        
        <div className="w-full sm:max-w-md bg-gray-50 min-h-screen relative shadow-2xl flex flex-col overflow-x-hidden">
          
          <div className="flex-1 w-full pb-32">
            {children}
          </div>

          {/* 核心修复：把 z-[100] 降级为 z-40，允许弹窗覆盖导航栏 */}
          <nav 
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
            className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[26rem] bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/60 flex justify-between items-center px-3 py-2.5 rounded-full z-40"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="relative flex flex-col items-center justify-center w-[18%] active:scale-90 transition-transform duration-200"
                >
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-500'} 
                  />
                  <span className={`text-[9px] mt-1 font-black tracking-wide ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
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
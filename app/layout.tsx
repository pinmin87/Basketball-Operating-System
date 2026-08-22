'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, BookOpen, ClipboardCheck, Wallet } from 'lucide-react';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 释放 Body 原生滚动，彻底解决 iOS 页面切换时高度跳动的问题
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
          
          {/* 留出充足的底部空间，因为悬浮导航栏会占据一定高度 */}
          <div className="flex-1 w-full pb-32">
            {children}
          </div>

          {/* 
            【全新高级定制】悬浮胶囊导航栏 (Floating Pill Dock)
            1. bottom: calc(...) -> 强制离开底部黑线，往上悬浮，绝对好点且不会掉下去！
            2. w-[calc(100%-2rem)] 和 rounded-full -> 左右留白，两边半圆形，悬浮感十足！
            3. 保留了文字标签，比例完美。
          */}
          <nav 
            style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
            className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[26rem] bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200/60 flex justify-between items-center px-3 py-2.5 rounded-full z-[100]"
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
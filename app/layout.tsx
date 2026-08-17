'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, BookOpen, ClipboardCheck, Wallet } from 'lucide-react';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 专治 iPhone PWA 页面乱跳和橡皮筋效应
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
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
        {/* Apple PWA 专属 Meta 标签，锁定视口，防止双重导航栏 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-gray-200 text-gray-900 sm:flex sm:justify-center">
        
        {/* 使用 h-[100dvh] 完美适配 iPhone 动态高度，解决底部被挡问题 */}
        <div className="w-full sm:max-w-md bg-gray-50 h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden">
          
          {/* 身体区：设为 flex-1 和 overflow-y-auto，让内容在这里面顺滑滚动 */}
          <div className="flex-1 overflow-y-auto w-full">
            {children}
          </div>

          {/* 底部导航栏：脱离文档流，固定在最底端，自动预留 safe-area */}
          <nav className="shrink-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-200/50 flex justify-between items-center px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+10px)] z-50">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-[20%] active:scale-95 transition-transform">
                  <div className={`p-1.5 rounded-2xl transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] mt-1 font-bold tracking-wide ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>
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
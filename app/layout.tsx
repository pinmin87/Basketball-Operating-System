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
        
        {/* 取消了固定高度限制，让内容自然延伸 */}
        <div className="w-full sm:max-w-md bg-gray-50 min-h-screen relative shadow-2xl flex flex-col">
          
          {/* 内容区底部预留足够的空间 (pb-28)，防止内容被底部的导航栏遮挡 */}
          <div className="flex-1 w-full pb-28">
            {children}
          </div>

          {/* 
            【核心重构】IG 风格悬浮底部导航栏
            1. fixed bottom-0：像钉子一样死死钉在屏幕最下方，绝对不再乱跳！
            2. 去掉文字，图标放大到 size 28，点击区域更大、更准。
            3. 加入了 max(env(safe-area-inset-bottom),16px)，完美包裹 iPhone 底部的横线。
          */}
          <nav className="fixed bottom-0 w-full sm:max-w-md mx-auto bg-white/90 backdrop-blur-2xl border-t border-gray-200/50 flex justify-between items-center px-6 pt-3 pb-[max(env(safe-area-inset-bottom),16px)] z-[100]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="relative flex flex-col items-center justify-center w-14 h-12 active:scale-90 transition-transform duration-200"
                >
                  {/* 未选中时是灰色细线，选中时变成高级纯黑粗线 (IG 风格) */}
                  <Icon 
                    size={28} 
                    strokeWidth={isActive ? 2.5 : 1.5} 
                    className={isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-500'} 
                  />
                  
                  {/* IG 风格的极简状态指示器 (选中的图标下方会出现一个小黑点) */}
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-gray-900 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>
          
        </div>
      </body>
    </html>
  );
}
'use client';
import { Home, ClipboardList, Wallet, Settings, CalendarDays, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Calendar', href: '/calendar', icon: CalendarDays },
    { name: 'Classes', href: '/classes', icon: BookOpen }, // 您要求的 Classes 按钮已就位
    { name: 'Attendance', href: '/attendance', icon: ClipboardList },
    { name: 'Fees', href: '/fees', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full h-full space-y-1">
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-blue-50' : 'transparent'}`}>
                <Icon size={24} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
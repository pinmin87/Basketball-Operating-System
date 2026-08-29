'use client';

import Link from 'next/link';
import { Users, CalendarDays, ClipboardCheck, Wallet, Activity, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  // 💡 这里的状态未来可以连接您的数据库，自动判断学院是否有付费 (ACTIVE 或是 PENDING)
  const subscriptionStatus = 'ACTIVE'; 

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 顶部欢迎与状态区 */}
      <header className="bg-blue-600 text-white p-6 pt-safe pb-8 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Activity size={120} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start mt-4">
          <div>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Move Academy</p>
            <h1 className="text-3xl font-black">Dashboard Center</h1>
          </div>
          
          {/* 右上角订阅状态 (Subscription Status) */}
          <div className="mt-1">
            {subscriptionStatus === 'ACTIVE' ? (
              <div className="flex items-center space-x-1 bg-green-400/20 border border-green-400/50 text-green-50 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                <CheckCircle2 size={12} className="text-green-300" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-orange-400/20 border border-orange-400/50 text-orange-50 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="p-5 -mt-6 relative z-20 space-y-6">
        
        {/* 今日概览卡片 (Today's Overview) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Today's Training</h3>
            <p className="text-2xl font-black text-gray-900">Ready</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
            <CalendarDays size={24} />
          </div>
        </div>

        {/* 核心快捷入口 (Quick Actions) */}
        <div>
          <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            
            <Link href="/classes" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-3">
                <CalendarDays size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Classes</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Manage schedules</p>
            </Link>

            <Link href="/players" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-3">
                <Users size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Players</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Student profiles</p>
            </Link>

            {/* ✅ Attendance 链接已打通 */}
            <Link href="/attendance" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-3">
                <ClipboardCheck size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Attendance</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Take roll call</p>
            </Link>

            {/* ✅ Fees 链接已打通 */}
            <Link href="/fees" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-amber-50 text-amber-600 p-4 rounded-full mb-3">
                <Wallet size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Fees</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Collect payments</p>
            </Link>

          </div>
        </div>

        {/* 底部版本提示 */}
        <div className="bg-gray-200/50 rounded-2xl p-4 text-center">
          <p className="text-xs font-bold text-gray-500">Move Academy OS v1.0 MVP</p>
        </div>

      </div>
    </div>
  );
}
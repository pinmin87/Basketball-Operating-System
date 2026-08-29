'use client';

import Link from 'next/link';
import { Users, CalendarDays, ClipboardCheck, Wallet, Activity, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  // 💡 订阅状态
  const subscriptionStatus = 'ACTIVE'; 
  
  // 💡 数据概览模拟数据 (未来接入 Supabase 真实数据)
  const metrics = {
    totalPlayers: 86,
    activeClasses: 12,
    feesCollected: 5800,
    feesOutstanding: 1200,
    currentMonth: "AUG 2026"
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 顶部欢迎与核心运营数据区 */}
      <header className="bg-blue-600 text-white p-6 pt-safe pb-10 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        {/* 背景装饰图标 */}
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Activity size={120} />
        </div>
        
        {/* 标题与状态 */}
        <div className="relative z-10 flex justify-between items-start mt-4 mb-6">
          <div className="flex-1 pr-2 overflow-hidden">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Move Academy</p>
            <h1 className="text-xl sm:text-2xl font-black truncate">Dashboard Center</h1>
          </div>
          
          <div className="mt-1 shrink-0">
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

        {/* Total Players 和 Active Classes */}
        <div className="relative z-10 grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
          <div>
            <p className="text-blue-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">Total Players</p>
            <p className="text-2xl font-black text-white">{metrics.totalPlayers}</p>
          </div>
          <div>
            <p className="text-blue-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">Active Classes</p>
            <p className="text-2xl font-black text-white">{metrics.activeClasses}</p>
          </div>
        </div>
      </header>

      <div className="p-5 -mt-4 relative z-20 space-y-8">
        
        {/* 财务数据区，统一月份显示在顶部 */}
        <div>
          <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2 flex items-center">
            Fees Overview <span className="bg-gray-200 text-gray-500 px-2 py-0.5 rounded-md ml-2 text-[10px]">{metrics.currentMonth}</span>
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-4 rounded-[1.5rem] shadow-sm border border-green-100 flex flex-col justify-center">
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">Collected</span>
              <span className="text-xl font-black text-green-700">RM {metrics.feesCollected}</span>
            </div>
            <div className="bg-red-50 p-4 rounded-[1.5rem] shadow-sm border border-red-100 flex flex-col justify-center">
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-1">Outstanding</span>
              <span className="text-xl font-black text-red-700">RM {metrics.feesOutstanding}</span>
            </div>
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

            <Link href="/attendance" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-3">
                <ClipboardCheck size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Attendance</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Take roll call</p>
            </Link>

            <Link href="/fees" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-amber-50 text-amber-600 p-4 rounded-full mb-3">
                <Wallet size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Fees</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Collect payments</p>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
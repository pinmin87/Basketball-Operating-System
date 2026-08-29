'use client';

import Link from 'next/link';
import { Users, CalendarDays, ClipboardCheck, Wallet, Activity, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  // 💡 订阅状态
  const subscriptionStatus = 'ACTIVE'; 
  
  // 💡 这里是数据概览的模拟数据 (未来我们会接入 Supabase 真实数据)
  const metrics = {
    totalPlayers: 86,
    activeClasses: 12,
    feesCollected: 5800,
    feesOutstanding: 1200,
    currentMonth: "Aug 2026"
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 顶部欢迎与状态区 */}
      <header className="bg-blue-600 text-white p-6 pt-safe pb-8 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Activity size={120} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start mt-4">
          {/* ✅ 修改1：缩小标题字号，并强制单行显示 (truncate) */}
          <div className="flex-1 pr-2 overflow-hidden">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Move Academy</p>
            <h1 className="text-xl sm:text-2xl font-black truncate">Dashboard Center</h1>
          </div>
          
          {/* 右上角订阅状态 (Subscription Status) 保持不变 */}
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
      </header>

      <div className="p-5 -mt-6 relative z-20 space-y-6">
        
        {/* 今日概览卡片 (Today's Overview) - 保持不变 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Today's Training</h3>
            <p className="text-2xl font-black text-gray-900">Ready</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
            <CalendarDays size={24} />
          </div>
        </div>

        {/* ✅ 修改2：新增的核心数据概览 (Academy Metrics) */}
        <div>
          <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Academy Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Players</span>
              <span className="text-2xl font-black text-gray-900">{metrics.totalPlayers}</span>
            </div>
            <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-center">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Classes</span>
              <span className="text-2xl font-black text-gray-900">{metrics.activeClasses}</span>
            </div>
            <div className="bg-green-50 p-4 rounded-[1.5rem] shadow-sm border border-green-100 flex flex-col justify-center">
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-1">Collected ({metrics.currentMonth})</span>
              <span className="text-xl font-black text-green-700">RM {metrics.feesCollected}</span>
            </div>
            <div className="bg-red-50 p-4 rounded-[1.5rem] shadow-sm border border-red-100 flex flex-col justify-center">
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-1">Outstanding</span>
              <span className="text-xl font-black text-red-700">RM {metrics.feesOutstanding}</span>
            </div>
          </div>
        </div>

        {/* 核心快捷入口 (Quick Actions) - 保持不变 */}
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

        {/* 底部版本提示 - 保持不变 */}
        <div className="bg-gray-200/50 rounded-2xl p-4 text-center">
          <p className="text-xs font-bold text-gray-500">Move Academy OS v1.0 MVP</p>
        </div>

      </div>
    </div>
  );
}
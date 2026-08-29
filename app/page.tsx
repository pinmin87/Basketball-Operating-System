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
    // ✅ 使用 h-[100dvh] 和 overflow-hidden 彻底锁死屏幕，禁止上下滑动产生空白
    <div className="bg-gray-50 h-[100dvh] flex flex-col overflow-hidden overscroll-none">
      
      {/* 顶部欢迎与核心运营数据区 (固定不压缩) */}
      <header className="shrink-0 bg-blue-600 text-white p-6 pt-safe pb-10 rounded-b-[2.5rem] shadow-md relative">
        {/* 背景装饰图标 */}
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Activity size={120} />
        </div>
        
        {/* 标题与状态 */}
        <div className="relative z-10 flex justify-between items-start mt-2 mb-5">
          <div className="flex-1 pr-2 overflow-hidden">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-0.5">Move Academy</p>
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

      {/* 下方内容区：动态填满剩余空间 (flex-1) 并且优化间距 */}
      <div className="flex-1 p-5 -mt-4 relative z-20 flex flex-col gap-5">
        
        {/* ✅ 修改：财务数据区，将月份 (AUG 2026) 移到标题正下方，并进行现代风美化 */}
        <div className="shrink-0">
          <div className="flex flex-col ml-2 mb-2.5">
            <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest">
              Fees Overview
            </h2>
            {/* 高颜值月份徽章 (Badge) */}
            <div className="mt-1.5 inline-flex items-center bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl w-max shadow-sm active:scale-95 transition-transform">
               <CalendarDays size={14} className="mr-1.5 text-indigo-500" />
               <span className="text-[11px] font-black tracking-widest">{metrics.currentMonth}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-4 rounded-[1.5rem] shadow-sm border border-green-100 flex flex-col justify-center">
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-0.5">Collected</span>
              <span className="text-xl font-black text-green-700">RM {metrics.feesCollected}</span>
            </div>
            <div className="bg-red-50 p-4 rounded-[1.5rem] shadow-sm border border-red-100 flex flex-col justify-center">
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-0.5">Outstanding</span>
              <span className="text-xl font-black text-red-700">RM {metrics.feesOutstanding}</span>
            </div>
          </div>
        </div>

        {/* 核心快捷入口 (Quick Actions) */}
        <div className="flex-1">
          <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-2">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            
            <Link href="/classes" className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-full mb-2">
                <CalendarDays size={26} />
              </div>
              <h3 className="font-black text-gray-900 text-[14px]">Classes</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Manage schedules</p>
            </Link>

            <Link href="/players" className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-full mb-2">
                <Users size={26} />
              </div>
              <h3 className="font-black text-gray-900 text-[14px]">Players</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Student profiles</p>
            </Link>

            <Link href="/attendance" className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-full mb-2">
                <ClipboardCheck size={26} />
              </div>
              <h3 className="font-black text-gray-900 text-[14px]">Attendance</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Take roll call</p>
            </Link>

            <Link href="/fees" className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-full mb-2">
                <Wallet size={26} />
              </div>
              <h3 className="font-black text-gray-900 text-[14px]">Fees</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Collect payments</p>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Calendar, CheckSquare, Wallet, Plus, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [playersCount, setPlayersCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [feesData, setFeesData] = useState({ collected: 420, outstanding: 340 });
  const [todayAttendance, setTodayAttendance] = useState({ present: 8, absent: 2, late: 1 });

  useEffect(() => {
    setIsMounted(true);
    const savedPlayers = localStorage.getItem('academy_players');
    if (savedPlayers) {
      try { setPlayersCount(JSON.parse(savedPlayers).length); } catch (e) {}
    } else {
      setPlayersCount(5);
    }

    const savedClasses = localStorage.getItem('academy_classes');
    if (savedClasses) {
      try { setClassesCount(JSON.parse(savedClasses).length); } catch (e) {}
    } else {
      setClassesCount(3);
    }

    const savedFees = localStorage.getItem('academy_fees');
    if (savedFees) {
      try {
        const fees = JSON.parse(savedFees);
        const col = fees.reduce((sum: number, f: any) => sum + (f.amountPaid || 0), 0);
        const exp = fees.reduce((sum: number, f: any) => sum + (f.monthlyFee || 0), 0);
        setFeesData({ collected: col, outstanding: exp - col });
      } catch (e) {}
    }
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 font-bold animate-pulse">Loading Dashboard...</p></div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      {/* 顶部蓝色品牌区 */}
      <header className="bg-blue-600 text-white p-6 pt-safe rounded-b-[2.5rem] shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Basketball Academy</p>
            <h1 className="text-2xl font-black mt-0.5">Command Center</h1>
          </div>
          <div className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-black backdrop-blur-md">
            ACTIVE SEASON
          </div>
        </div>

        {/* 核心数据卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-700/50 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">Total Players</p>
            <div className="flex items-center space-x-2">
              <Users size={20} className="text-blue-300" />
              <span className="text-3xl font-black">{playersCount}</span>
            </div>
          </div>
          <div className="bg-blue-700/50 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">Active Classes</p>
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-blue-300" />
              <span className="text-3xl font-black">{classesCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容区 */}
      <div className="p-4 space-y-4">
        
        {/* 财务看板概览 */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
              <Wallet size={16} className="text-blue-600 mr-2" /> August 2026 Fees
            </h3>
            <Link href="/fees" className="text-xs font-bold text-blue-600 flex items-center hover:underline">
              Manage <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Collected</p>
              <p className="text-xl font-black text-green-600">RM {feesData.collected}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Outstanding</p>
              <p className="text-xl font-black text-red-600">RM {feesData.outstanding}</p>
            </div>
          </div>
        </div>

        {/* 今日考勤概览 */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
              <CheckSquare size={16} className="text-blue-600 mr-2" /> Today's Attendance
            </h3>
            <Link href="/attendance" className="text-xs font-bold text-blue-600 flex items-center hover:underline">
              Take Roll <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50 text-center">
            <div className="bg-green-50 p-2.5 rounded-2xl">
              <p className="text-lg font-black text-green-700">{todayAttendance.present}</p>
              <p className="text-[9px] font-bold text-green-600 uppercase">Present</p>
            </div>
            <div className="bg-red-50 p-2.5 rounded-2xl">
              <p className="text-lg font-black text-red-700">{todayAttendance.absent}</p>
              <p className="text-[9px] font-bold text-red-600 uppercase">Absent</p>
            </div>
            <div className="bg-orange-50 p-2.5 rounded-2xl">
              <p className="text-lg font-black text-orange-700">{todayAttendance.late}</p>
              <p className="text-[9px] font-bold text-orange-600 uppercase">Late</p>
            </div>
          </div>
        </div>

        {/* 快捷操作区 (Quick Actions) */}
        <div>
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 ml-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/players?autoAdd=true" className="bg-blue-600 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between active:scale-95 transition-all">
              <Plus size={24} className="mb-4 text-blue-200" />
              <div>
                <p className="font-black text-sm">Add Player</p>
                <p className="text-[10px] text-blue-200 font-medium">Register new student</p>
              </div>
            </Link>
            <Link href="/attendance" className="bg-white text-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between active:scale-95 transition-all">
              <CheckSquare size={24} className="mb-4 text-blue-600" />
              <div>
                <p className="font-black text-sm">Take Attendance</p>
                <p className="text-[10px] text-gray-400 font-medium">Mark daily session</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
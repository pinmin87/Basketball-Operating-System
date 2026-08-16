'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Calendar, CheckSquare, Wallet, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [playersCount, setPlayersCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [feesData, setFeesData] = useState({ collected: 0, outstanding: 0 });
  const [todayAttendance, setTodayAttendance] = useState({ present: 8, absent: 2, late: 1 }); // 演示数据

  useEffect(() => {
    setIsMounted(true);
    
    // 读取 Players 数量
    const savedPlayers = localStorage.getItem('academy_players');
    if (savedPlayers) {
      try { setPlayersCount(JSON.parse(savedPlayers).length); } catch (e) {}
    } else {
      setPlayersCount(2); // 默认数据
    }

    // 读取 Classes 数量
    const savedClasses = localStorage.getItem('academy_classes');
    if (savedClasses) {
      try { setClassesCount(JSON.parse(savedClasses).length); } catch (e) {}
    } else {
      setClassesCount(2); // 默认数据
    }

    // 读取 Fees 数据
    const savedFees = localStorage.getItem('academy_fees');
    if (savedFees) {
      try {
        const fees = JSON.parse(savedFees);
        const col = fees.reduce((sum: number, f: any) => sum + (Number(f.amountPaid) || 0), 0);
        const exp = fees.reduce((sum: number, f: any) => sum + (Number(f.monthlyFee) || 0), 0);
        setFeesData({ collected: col, outstanding: exp - col });
      } catch (e) {}
    } else {
      setFeesData({ collected: 420, outstanding: 340 }); // 默认数据
    }
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 font-bold animate-pulse">Loading Command Center...</p></div>;

  return (
    <main className="min-h-screen bg-gray-100 pb-32">
      {/* 居中防拉伸锁 */}
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-2xl border-x border-gray-200/60 overflow-hidden relative">
        
        {/* 顶部蓝色品牌区 */}
        <header className="bg-blue-600 text-white p-6 pt-safe rounded-b-[2.5rem] shadow-md relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-60 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Basketball Academy</p>
              <h1 className="text-2xl font-black leading-none">Command Center</h1>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider backdrop-blur-md border border-white/10 shadow-sm">
              ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="bg-blue-700/40 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">Total Players</p>
              <div className="flex items-center space-x-2 mt-1">
                <Users size={20} className="text-blue-300" />
                <span className="text-3xl font-black">{playersCount}</span>
              </div>
            </div>
            <div className="bg-blue-700/40 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">Active Classes</p>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar size={20} className="text-blue-300" />
                <span className="text-3xl font-black">{classesCount}</span>
              </div>
            </div>
          </div>
        </header>

        {/* 主体内容区 */}
        <div className="p-5 space-y-5 relative z-10 mt-[-10px]">
          
          {/* 财务看板概览 */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
                <Wallet size={16} className="text-blue-600 mr-2" /> August 2026 Fees
              </h3>
              {/* 删除了 Manage 按钮，保持看板清爽 */}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50/80">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Collected</p>
                <p className="text-xl font-black text-green-600">RM {feesData.collected}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Outstanding</p>
                <p className="text-xl font-black text-red-500">RM {feesData.outstanding}</p>
              </div>
            </div>
          </div>

          {/* 今日考勤概览 */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
                <CheckSquare size={16} className="text-blue-600 mr-2" /> Today's Attendance
              </h3>
              {/* 删除了 Take Roll 按钮，保持看板清爽 */}
            </div>
            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-gray-50/80 text-center">
              <div className="bg-green-50 p-3 rounded-2xl border border-green-100/50">
                <p className="text-xl font-black text-green-600 leading-none mb-1">{todayAttendance.present}</p>
                <p className="text-[9px] font-black text-green-600/70 uppercase tracking-wider">Present</p>
              </div>
              <div className="bg-red-50 p-3 rounded-2xl border border-red-100/50">
                <p className="text-xl font-black text-red-600 leading-none mb-1">{todayAttendance.absent}</p>
                <p className="text-[9px] font-black text-red-600/70 uppercase tracking-wider">Absent</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100/50">
                <p className="text-xl font-black text-orange-500 leading-none mb-1">{todayAttendance.late}</p>
                <p className="text-[9px] font-black text-orange-500/70 uppercase tracking-wider">Late</p>
              </div>
            </div>
          </div>

          {/* 快捷操作区 (Quick Actions) */}
          <div>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/players?autoAdd=true" className="bg-blue-600 text-white p-4 rounded-3xl shadow-[0_4px_14px_0_rgba(37,99,235,0.25)] flex flex-col justify-between active:scale-95 transition-all hover:bg-blue-700 h-28">
                <Plus size={22} className="mb-2 text-blue-200" />
                <div>
                  <p className="font-black text-sm mb-0.5">Add Player</p>
                  <p className="text-[9px] text-blue-200/80 font-bold uppercase tracking-wider">Register new</p>
                </div>
              </Link>
              <Link href="/attendance" className="bg-white text-gray-900 p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between active:scale-95 transition-all hover:border-blue-200 h-28">
                <CheckSquare size={22} className="mb-2 text-blue-600" />
                <div>
                  <p className="font-black text-sm mb-0.5">Take Attendance</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mark daily session</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
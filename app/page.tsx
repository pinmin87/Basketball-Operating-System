'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Calendar, CheckSquare, Wallet, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 🚀 核心修复：直接在页面内初始化 Supabase，100% 避免路径找不到的 Error
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [playersCount, setPlayersCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [feesData, setFeesData] = useState({ collected: 0, outstanding: 0 });
  const [todayAttendance, setTodayAttendance] = useState({ present: 8, absent: 2, late: 1 });

  useEffect(() => {
    setIsMounted(true);
    
    try {
      const savedPlayers = localStorage.getItem('academy_players');
      if (savedPlayers) {
        const parsed = JSON.parse(savedPlayers);
        if (Array.isArray(parsed)) setPlayersCount(parsed.length);
      } else setPlayersCount(1);
    } catch (e) {}

    try {
      const savedClasses = localStorage.getItem('academy_classes');
      if (savedClasses) {
        const parsed = JSON.parse(savedClasses);
        if (Array.isArray(parsed)) setClassesCount(parsed.length);
      } else setClassesCount(1);
    } catch (e) {}
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (!isMounted) return <div className="h-full flex items-center justify-center"><p className="text-gray-400 font-bold animate-pulse">Loading Command Center...</p></div>;

  return (
    <main className="w-full bg-gray-50 pb-10">
      <header className="bg-blue-600 text-white p-6 pt-safe rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-60 pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6 relative z-10 pt-4">
          <div>
            <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Basketball Academy</p>
            <h1 className="text-2xl font-black leading-none">Command Center</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-sm hover:bg-white/20 transition-all active:scale-95"
            title="Logout"
          >
            <LogOut size={18} className="text-white" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-blue-700/40 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">Total Players</p>
            <div className="flex items-center space-x-2 mt-1"><Users size={20} className="text-blue-300" /><span className="text-3xl font-black">{playersCount}</span></div>
          </div>
          <div className="bg-blue-700/40 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">Active Classes</p>
            <div className="flex items-center space-x-2 mt-1"><Calendar size={20} className="text-blue-300" /><span className="text-3xl font-black">{classesCount}</span></div>
          </div>
        </div>
      </header>

      <div className="p-5 space-y-5 relative z-10 mt-[-10px]">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
              <Wallet size={16} className="text-blue-600 mr-2" /> August 2026 Fees
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50/80">
            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Collected</p><p className="text-xl font-black text-green-600">RM 0</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Outstanding</p><p className="text-xl font-black text-red-500">RM 0</p></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center">
              <CheckSquare size={16} className="text-blue-600 mr-2" /> Today's Attendance
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-gray-50/80 text-center">
            <div className="bg-green-50 p-3 rounded-2xl border border-green-100/50"><p className="text-xl font-black text-green-600 leading-none mb-1">{todayAttendance.present}</p><p className="text-[9px] font-black text-green-600/70 uppercase tracking-wider">Present</p></div>
            <div className="bg-red-50 p-3 rounded-2xl border border-red-100/50"><p className="text-xl font-black text-red-600 leading-none mb-1">{todayAttendance.absent}</p><p className="text-[9px] font-black text-red-600/70 uppercase tracking-wider">Absent</p></div>
            <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100/50"><p className="text-xl font-black text-orange-500 leading-none mb-1">{todayAttendance.late}</p><p className="text-[9px] font-black text-orange-500/70 uppercase tracking-wider">Late</p></div>
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/players" className="bg-blue-600 text-white p-4 rounded-3xl shadow-[0_4px_14px_0_rgba(37,99,235,0.25)] flex flex-col justify-between active:scale-95 transition-all hover:bg-blue-700 h-28">
              <Users size={22} className="mb-2 text-blue-200" />
              <div>
                <p className="font-black text-sm mb-0.5">Players</p>
                <p className="text-[9px] text-blue-200/80 font-bold uppercase tracking-wider">Manage All</p>
              </div>
            </Link>
            <Link href="/attendance" className="bg-white text-gray-900 p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between active:scale-95 transition-all hover:border-blue-200 h-28">
              <CheckSquare size={22} className="mb-2 text-blue-600" />
              <div>
                <p className="font-black text-sm mb-0.5">Take Attendance</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mark Session</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
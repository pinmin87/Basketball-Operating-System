'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, CalendarDays, ClipboardCheck, Wallet, Activity, CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase 初始化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const subscriptionStatus = 'ACTIVE'; 
  
  const [metrics, setMetrics] = useState({
    totalPlayers: 0,
    activeClasses: 0,
    feesCollected: 0,
    feesOutstanding: 0,
    currentMonth: ""
  });

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    const monthStr = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
    setMetrics(prev => ({ ...prev, currentMonth: monthStr }));
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', session.user.id).single();
      const currentAcademyId = profile?.academy_id;

      if (!currentAcademyId) return;

      const now = new Date();
      const currentMonthPrefix = now.toISOString().substring(0, 7);

      const [playersRes, classesRes, enrollmentsRes, feesRes] = await Promise.all([
        supabase.from('players').select('id').eq('academy_id', currentAcademyId).eq('status', 'ACTIVE'),
        supabase.from('classes').select('*').eq('academy_id', currentAcademyId),
        supabase.from('player_class').select('*').eq('status', 'ACTIVE'),
        supabase.from('fee_records').select('amount_paid').eq('academy_id', currentAcademyId).eq('billing_month', currentMonthPrefix)
      ]);

      const activePlayersCount = playersRes.data?.length || 0;
      const classesData = classesRes.data || [];
      const activeClassesCount = classesData.length;
      const enrollmentsData = enrollmentsRes.data || [];
      const feesData = feesRes.data || [];

      let totalExpected = 0;
      enrollmentsData.forEach(enroll => {
        const cls = classesData.find(c => c.id === enroll.class_id);
        if (cls) totalExpected += Number(cls.monthly_fee || 0);
      });

      let totalCollected = 0;
      feesData.forEach(fee => {
        totalCollected += Number(fee.amount_paid || 0);
      });

      const totalOutstanding = totalExpected - totalCollected;

      setMetrics(prev => ({
        ...prev,
        totalPlayers: activePlayersCount,
        activeClasses: activeClassesCount,
        feesCollected: totalCollected,
        feesOutstanding: totalOutstanding
      }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 核心新增：退出登录功能
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (!isMounted) return null;

  return (
    <div className="bg-gray-50 h-[100dvh] flex flex-col overflow-hidden overscroll-none">
      
      <header className="shrink-0 bg-blue-600 text-white p-6 pt-safe pb-10 rounded-b-[2.5rem] shadow-md relative">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Activity size={120} />
        </div>
        
        <div className="relative z-10 flex justify-between items-start mt-2 mb-5">
          <div className="flex-1 pr-2 overflow-hidden">
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-0.5">Move Academy</p>
            <h1 className="text-xl sm:text-2xl font-black truncate">Dashboard Center</h1>
          </div>
          
          <div className="mt-1 shrink-0 flex items-center space-x-2">
            {subscriptionStatus === 'ACTIVE' && (
              <div className="flex items-center space-x-1 bg-green-400/20 border border-green-400/50 text-green-50 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                <CheckCircle2 size={12} className="text-green-300" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
            )}
            
            {/* 🚀 新增：登出按钮 */}
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-white/10 hover:bg-white/20 border border-white/20 p-1.5 rounded-full transition-colors active:scale-95 flex items-center justify-center backdrop-blur-sm"
              title="Log Out"
            >
              {isLoggingOut ? <Loader2 size={16} className="animate-spin text-white" /> : <LogOut size={16} className="text-white" />}
            </button>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
          <div>
            <p className="text-blue-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">Total Players</p>
            <p className="text-2xl font-black text-white">
              {isLoading ? <Loader2 size={24} className="animate-spin mt-1" /> : metrics.totalPlayers}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-[11px] font-bold uppercase tracking-widest mb-0.5">Active Classes</p>
            <p className="text-2xl font-black text-white">
              {isLoading ? <Loader2 size={24} className="animate-spin mt-1" /> : metrics.activeClasses}
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-5 -mt-4 relative z-20 flex flex-col gap-5">
        
        <div className="shrink-0 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col ml-2 mb-2.5">
            <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest">
              Fees Overview
            </h2>
            <div className="mt-1.5 inline-flex items-center bg-white border border-indigo-100 text-indigo-600 px-3 py-1.5 rounded-xl w-max shadow-sm active:scale-95 transition-transform">
               <CalendarDays size={14} className="mr-1.5 text-indigo-500" />
               <span className="text-[11px] font-black tracking-widest">{metrics.currentMonth}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-4 rounded-[1.5rem] shadow-sm border border-green-100 flex flex-col justify-center">
              <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest mb-0.5">Collected</span>
              <span className="text-xl font-black text-green-700">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : `RM ${metrics.feesCollected}`}
              </span>
            </div>
            <div className="bg-red-50 p-4 rounded-[1.5rem] shadow-sm border border-red-100 flex flex-col justify-center">
              <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-0.5">Outstanding</span>
              <span className="text-xl font-black text-red-700">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : `RM ${metrics.feesOutstanding}`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-2.5 ml-2">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            
            <Link href="/classes" className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-full mb-2"><CalendarDays size={26} /></div>
              <h3 className="font-black text-gray-900 text-[14px]">Classes</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Manage schedules</p>
            </Link>

            <Link href="/players" className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-full mb-2"><Users size={26} /></div>
              <h3 className="font-black text-gray-900 text-[14px]">Players</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Student profiles</p>
            </Link>

            <Link href="/attendance" className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-full mb-2"><ClipboardCheck size={26} /></div>
              <h3 className="font-black text-gray-900 text-[14px]">Attendance</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Take roll call</p>
            </Link>

            <Link href="/fees" className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-full mb-2"><Wallet size={26} /></div>
              <h3 className="font-black text-gray-900 text-[14px]">Fees</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Collect payments</p>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
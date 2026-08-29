'use client';

import Link from 'next/link';
import { Users, CalendarDays, ClipboardCheck, Wallet, Activity } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Section */}
      <header className="bg-blue-600 text-white p-6 pt-safe pb-8 rounded-b-[2.5rem] shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Activity size={120} />
        </div>
        <div className="relative z-10 mt-4">
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest mb-1">Welcome Back, Coach</p>
          <h1 className="text-3xl font-black">Academy Dashboard</h1>
        </div>
      </header>

      <div className="p-5 -mt-6 relative z-20 space-y-6">
        
        {/* Today's Overview Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">Today's Training</h3>
            <p className="text-2xl font-black text-gray-900">Ready</p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
            <CalendarDays size={24} />
          </div>
        </div>

        {/* Quick Actions Navigation */}
        <div>
          <h2 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Link to Classes */}
            <Link href="/classes" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-3">
                <CalendarDays size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Classes</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Manage schedules</p>
            </Link>

            {/* Link to Players */}
            <Link href="/players" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-3">
                <Users size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Players</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Student profiles</p>
            </Link>

            {/* Link to future modules */}
            <Link href="#" onClick={(e) => { e.preventDefault(); alert('Attendance Module Coming Next!'); }} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-3">
                <ClipboardCheck size={28} />
              </div>
              <h3 className="font-black text-gray-900 text-[15px]">Attendance</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-1">Take roll call</p>
            </Link>

            <Link href="#" onClick={(e) => { e.preventDefault(); alert('Fee Module Coming Soon!'); }} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-transform">
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
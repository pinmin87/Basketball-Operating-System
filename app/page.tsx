import { Users, CalendarCheck, UserPlus, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部 Header */}
      <header className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-sm pt-safe">
        <h1 className="text-2xl font-bold mt-2">Coach Admin</h1>
        <p className="text-blue-100 text-sm mt-1">Friday, 14 August 2026</p>
      </header>

      <div className="p-4 space-y-6 -mt-4">
        {/* 数据看板 */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wider">Today's Classes</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-gray-800">2</p>
              <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-1 rounded-md">18 Expected</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 flex flex-col justify-between">
            <p className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wider">Unpaid Fees</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-red-600">RM 1,200</p>
              <span className="text-[10px] text-red-700 font-bold bg-red-100 px-2 py-1 rounded-md">8 Students</span>
            </div>
          </div>
        </section>

        {/* 快捷操作 (Quick Actions) - 全部修复为可点击的路由跳转 */}
        <section>
          <h2 className="text-gray-800 font-bold mb-3 px-1 text-lg">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            
            <Link href="/attendance" className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-100 transition-colors cursor-pointer">
              <div className="bg-blue-50 p-3 rounded-full mb-3">
                <CalendarCheck size={28} className="text-blue-600" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Attendance</span>
            </Link>
            
            <Link href="/fees" className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-100 transition-colors cursor-pointer">
              <div className="bg-green-50 p-3 rounded-full mb-3">
                <CreditCard size={28} className="text-green-600" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Collect Fee</span>
            </Link>
            
            <Link href="/players" className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-100 transition-colors cursor-pointer">
              <div className="bg-purple-50 p-3 rounded-full mb-3">
                <UserPlus size={28} className="text-purple-600" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Add Player</span>
            </Link>
            
            <Link href="/classes" className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-100 transition-colors cursor-pointer">
              <div className="bg-orange-50 p-3 rounded-full mb-3">
                <Users size={28} className="text-orange-600" />
              </div>
              <span className="font-bold text-gray-700 text-sm">Classes</span>
            </Link>
            
          </div>
        </section>
      </div>
    </main>
  );
}
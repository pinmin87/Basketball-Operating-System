'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatTime = (time24: string) => {
  if (!time24) return '';
  const [hourString, minute] = time24.split(':');
  const hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${ampm}`;
};

export default function CalendarPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Saturday'); // 默认展示周六

  useEffect(() => {
    setIsMounted(true);
    const savedClasses = localStorage.getItem('academy_classes');
    if (savedClasses) {
      try { setClasses(JSON.parse(savedClasses)); } catch (e) {}
    }
    
    // 自动定位到今天
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (DAYS_OF_WEEK.includes(today)) {
      setSelectedDay(today);
    }
  }, []);

  // 将所有班级的 Schedule 展平，方便按星期筛选
  const allSchedules: any[] = [];
  classes.forEach(cls => {
    if (cls.schedules && Array.isArray(cls.schedules)) {
      cls.schedules.forEach((sch: any) => {
        allSchedules.push({
          classId: cls.id,
          className: cls.name,
          skillLevel: cls.skillLevel,
          venue: cls.venue,
          enrolledCount: cls.enrolledPlayers?.length || 0,
          day: sch.day,
          startTime: sch.startTime,
          endTime: sch.endTime
        });
      });
    }
  });

  // 筛选出选中星期的课程，并按时间排序
  const daySchedules = allSchedules
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (!isMounted) return <div className="h-full flex items-center justify-center"><p className="text-gray-400 font-bold">Loading Calendar...</p></div>;

  return (
    <div className="bg-gray-50 min-h-full pb-20">
      <header className="bg-blue-600 text-white p-4 pt-safe pb-8 rounded-b-[2.5rem] shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-6 mt-2">
          <h1 className="text-2xl font-black">Weekly Schedule</h1>
          <CalendarIcon size={24} className="text-blue-200" />
        </div>
        
        {/* 星期滚动选择器 (横向滑动) */}
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = selectedDay === day;
            const shortDay = day.substring(0, 3).toUpperCase();
            return (
              <button 
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`snap-center shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all ${
                  isSelected 
                    ? 'bg-white text-blue-600 shadow-lg scale-105 border-2 border-white' 
                    : 'bg-blue-700/50 text-blue-200 hover:bg-blue-700/70'
                }`}
              >
                <span className={`text-[10px] font-black tracking-widest ${isSelected ? 'text-blue-400' : ''}`}>{shortDay}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-4 mt-2">
        <h2 className="text-lg font-black text-gray-900 mb-4">{selectedDay} Classes</h2>
        
        {daySchedules.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] p-8 text-center border border-gray-100 shadow-sm">
             <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
               <CalendarIcon size={24} className="text-gray-300" />
             </div>
             <p className="text-gray-500 font-bold">No classes scheduled for {selectedDay}.</p>
             <Link href="/classes" className="text-blue-600 text-sm font-black mt-2 inline-block hover:underline">
               Manage Classes &rarr;
             </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {daySchedules.map((sch, idx) => (
              <div key={idx} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex relative overflow-hidden">
                {/* 左侧时间线视觉 */}
                <div className="w-1.5 bg-blue-500 rounded-full absolute left-0 top-4 bottom-4"></div>
                
                <div className="pl-3 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-gray-900 text-lg">{sch.className}</h3>
                    <span className="inline-flex text-[9px] font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 uppercase tracking-widest">
                      {sch.skillLevel}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm font-bold text-gray-600">
                      <Clock size={14} className="mr-2 text-blue-400" />
                      {formatTime(sch.startTime)} - {formatTime(sch.endTime)}
                    </div>
                    <div className="flex items-center text-sm font-bold text-gray-600">
                      <MapPin size={14} className="mr-2 text-blue-400" />
                      {sch.venue || 'TBA'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="flex items-center text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <Users size={14} className="mr-1.5" />
                      {sch.enrolledCount} Students
                    </div>
                    <Link href="/attendance" className="flex items-center text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:bg-blue-100 transition-colors">
                      Take Roll <ChevronRight size={16} className="ml-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
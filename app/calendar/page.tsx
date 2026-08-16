'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatTime = (time24: string) => {
  if (!time24) return '';
  const [hourString, minute] = time24.split(':');
  const hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};

export default function CalendarPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Wednesday'); // 默认显示星期三，您可以根据需求改
  const [allSchedules, setAllSchedules] = useState<any[]>([]);

  // 核心逻辑：从 Classes 模块读取真实数据并转化为日历事件
  useEffect(() => {
    setIsMounted(true);
    // 获取当天的星期几作为默认选中日
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (DAYS_OF_WEEK.includes(today)) {
      setSelectedDay(today);
    }

    const saved = localStorage.getItem('academy_classes');
    if (saved) {
      try {
        const parsedClasses = JSON.parse(saved);
        const flatSchedules: any[] = [];
        
        // 遍历所有班级，把多节课拆解成一个个独立的日历事件
        parsedClasses.forEach((cls: any) => {
          if (cls.schedules && cls.schedules.length > 0) {
            cls.schedules.forEach((sch: any) => {
              flatSchedules.push({
                classId: cls.id,
                className: cls.name,
                skill: cls.skillLevel,
                venue: cls.venue || 'TBA',
                day: sch.day,
                start: sch.startTime,
                end: sch.endTime,
                studentCount: cls.enrolledPlayers ? cls.enrolledPlayers.length : 0
              });
            });
          }
        });
        
        setAllSchedules(flatSchedules);
      } catch (e) {
        console.error('Failed to parse classes for calendar', e);
      }
    }
  }, []);

  // 筛选出选定当天的课程，并按开始时间从早到晚排序
  const dayClasses = allSchedules
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-32">
        <p className="text-gray-400 font-bold animate-pulse">Loading Schedule...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-blue-600 text-white p-4 pt-safe pb-4 shadow-sm sticky top-0 z-20">
        <h1 className="text-xl font-bold mb-4">Weekly Schedule</h1>
        
        {/* 水平滚动的星期选择器 */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                selectedDay === day ? 'bg-white text-blue-600 shadow-md' : 'bg-blue-700/50 text-blue-100 active:bg-blue-700'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 mt-2">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-black text-gray-800">{selectedDay}'s Classes</h2>
          <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-lg">
            {dayClasses.length} {dayClasses.length === 1 ? 'Session' : 'Sessions'}
          </span>
        </div>
        
        {dayClasses.length === 0 ? (
          <div className="text-center bg-gray-100 rounded-3xl p-10 mt-10 border border-dashed border-gray-300">
            <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold">No classes scheduled</p>
            <p className="text-gray-400 text-sm mt-1">Enjoy your day off!</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-blue-100 ml-4 space-y-8 pb-8 mt-6">
            {dayClasses.map((cls, index) => (
              <div key={index} className="relative pl-6">
                {/* 时间轴圆点 */}
                <div className="absolute -left-[9px] top-1 bg-white border-4 border-blue-500 w-4 h-4 rounded-full shadow-sm"></div>
                
                <p className="text-blue-600 font-black text-sm mb-2">
                  {formatTime(cls.start)} - {formatTime(cls.end)}
                </p>
                
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{cls.className}</h3>
                    {/* 显示班级当前报名人数 */}
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md shrink-0 ml-2">
                      {cls.studentCount} Pax
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center text-xs font-bold text-gray-500 mt-3 gap-y-2">
                    <span className="flex items-center mr-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></div>
                      {cls.skill}
                    </span>
                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <MapPin size={12} className="mr-1 text-gray-400" /> {cls.venue}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
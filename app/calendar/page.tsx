'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Users, Clock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

// Supabase 初始化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  const [isLoading, setIsLoading] = useState(true);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Saturday');

  useEffect(() => {
    setIsMounted(true);
    
    // 自动定位到今天
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (DAYS_OF_WEEK.includes(today)) {
      setSelectedDay(today);
    }

    fetchDatabase();
  }, []);

  const fetchDatabase = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', session.user.id).single();
      const currentAcademyId = profile?.academy_id;

      if (currentAcademyId) {
        // 1. 获取真实班级
        const { data: classesData, error } = await supabase.from('classes').select('*').eq('academy_id', currentAcademyId);
        if (error) throw error;

        // 2. 获取真实的排班人数 (只查 ACTIVE 的学生)
        const { data: enrollmentData } = await supabase.from('player_class').select('class_id').eq('status', 'ACTIVE');
        
        // 计算每个班级的人数
        const counts: Record<string, number> = {};
        if (enrollmentData) {
          enrollmentData.forEach((row: any) => {
            counts[row.class_id] = (counts[row.class_id] || 0) + 1;
          });
        }

        // 把人数挂载到 class 数据里
        const formattedClasses = (classesData || []).map(cls => ({
          ...cls,
          enrolledCount: counts[cls.id] || 0
        }));

        setClasses(formattedClasses);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 核心修复：完美兼容新旧结构的班级展平算法
  const allSchedules: any[] = [];
  classes.forEach(cls => {
    // 情况 A：新版本带有 schedules 数组
    if (cls.schedules && cls.schedules.length > 0) {
      cls.schedules.forEach((sch: any) => {
        if (sch.dayOfWeek || sch.day) {
          allSchedules.push({
            classId: cls.id,
            className: cls.name,
            skillLevel: cls.skill_level || cls.skillLevel,
            venue: cls.venue,
            enrolledCount: cls.enrolledCount,
            day: sch.dayOfWeek || sch.day,
            startTime: sch.startTime || sch.start_time,
            endTime: sch.endTime || sch.end_time
          });
        }
      });
    } 
    // 情况 B：旧版本，数据直接在班级的 day_of_week 和 day_of_week_2 字段里
    else {
      if (cls.day_of_week) {
        allSchedules.push({
          classId: cls.id,
          className: cls.name,
          skillLevel: cls.skill_level,
          venue: cls.venue,
          enrolledCount: cls.enrolledCount,
          day: cls.day_of_week,
          startTime: cls.start_time?.substring(0,5),
          endTime: cls.end_time?.substring(0,5)
        });
      }
      if (cls.day_of_week_2) {
        allSchedules.push({
          classId: cls.id,
          className: cls.name,
          skillLevel: cls.skill_level,
          venue: cls.venue,
          enrolledCount: cls.enrolledCount,
          day: cls.day_of_week_2,
          startTime: cls.start_time_2?.substring(0,5),
          endTime: cls.end_time_2?.substring(0,5)
        });
      }
    }
  });

  // 筛选出选中星期的课程，并按时间先后顺序排序
  const daySchedules = allSchedules
    .filter(s => s.day === selectedDay)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

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
            
            // 检查这一天是否有课，如果有课，就在文字下面加个小白点
            const hasClasses = allSchedules.some(s => s.day === day);

            return (
              <button 
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`snap-center shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl transition-all relative ${
                  isSelected 
                    ? 'bg-white text-blue-600 shadow-lg scale-105 border-2 border-white' 
                    : 'bg-blue-700/50 text-blue-200 hover:bg-blue-700/70'
                }`}
              >
                <span className={`text-[11px] font-black tracking-widest ${isSelected ? 'text-blue-500' : ''}`}>{shortDay}</span>
                {hasClasses && (
                  <span className={`absolute bottom-3 w-1 h-1 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-blue-200'}`}></span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-4 mt-2 animate-in fade-in">
        <h2 className="text-lg font-black text-gray-900 mb-4">{selectedDay} Classes</h2>
        
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
             <p className="text-sm font-bold text-gray-500">Syncing schedule...</p>
           </div>
        ) : daySchedules.length === 0 ? (
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
              <div key={idx} className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex relative overflow-hidden active:scale-[0.98] transition-transform">
                {/* 左侧时间线视觉 */}
                <div className="w-1.5 bg-blue-500 rounded-full absolute left-0 top-4 bottom-4"></div>
                
                <div className="pl-3 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-gray-900 text-lg">{sch.className}</h3>
                    {sch.skillLevel && (
                      <span className="inline-flex text-[9px] font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 uppercase tracking-widest">
                        {sch.skillLevel}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm font-bold text-gray-600">
                      <Clock size={14} className="mr-2 text-blue-400" />
                      {formatTime(sch.startTime)} - {formatTime(sch.endTime)}
                    </div>
                    {sch.venue && (
                      <div className="flex items-center text-sm font-bold text-gray-600">
                        <MapPin size={14} className="mr-2 text-blue-400" />
                        {sch.venue}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <div className="flex items-center text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <Users size={14} className="mr-1.5 text-blue-400" />
                      {sch.enrolledCount} Active Players
                    </div>
                    
                    {/* 直接跳入点名页面的快捷键 */}
                    <Link href="/attendance" className="flex items-center text-sm font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl active:bg-blue-100 transition-colors shadow-sm">
                      Take Roll <ChevronRight size={16} className="ml-1" />
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
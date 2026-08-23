'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Clock, Users, CalendarDays, MoreVertical, X, Edit3, Trash2, Loader2, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_CLASS = { name: '', skillLevel: 'Foundation', venue: '', dayOfWeek: 'Saturday', startTime: '08:00', endTime: '10:00', monthlyFee: '', capacity: 20 };

export default function ClassesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [academyId, setAcademyId] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [enrolledCounts, setEnrolledCounts] = useState<Record<string, number>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState<any>(DEFAULT_CLASS);
  const [isSaving, setIsSaving] = useState(false);

  // 1. 初始化拉取数据
  useEffect(() => {
    setIsMounted(true);
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', session.user.id).single();
      const currentAcademyId = profile?.academy_id;

      if (currentAcademyId) {
        setAcademyId(currentAcademyId);
        
        // 拉取当前学院的所有班级
        const { data: classesData, error } = await supabase
          .from('classes')
          .select('*')
          .eq('academy_id', currentAcademyId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setClasses(classesData || []);

        // 统计每个班级的真实报名人数 (从 player_class 关系表)
        const { data: enrollmentData } = await supabase
          .from('player_class')
          .select('class_id')
          .eq('academy_id', currentAcademyId)
          .eq('status', 'ACTIVE');

        if (enrollmentData) {
          const counts: Record<string, number> = {};
          enrollmentData.forEach((row: any) => {
            counts[row.class_id] = (counts[row.class_id] || 0) + 1;
          });
          setEnrolledCounts(counts);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // 2. 保存班级到云端
  const handleSaveClass = async () => {
    if (!classForm.name || !classForm.monthlyFee) return alert('Class Name and Monthly Fee are required!');
    if (!academyId) return alert('Authentication Error. Please re-login.');

    setIsSaving(true);
    const payload = {
      academy_id: academyId,
      name: classForm.name,
      skill_level: classForm.skillLevel,
      venue: classForm.venue,
      day_of_week: classForm.dayOfWeek,
      start_time: classForm.startTime,
      end_time: classForm.endTime,
      monthly_fee: Number(classForm.monthlyFee),
      capacity: Number(classForm.capacity)
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('classes').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('classes').insert([payload]);
        if (error) throw error;
      }
      // 保存成功后刷新列表
      fetchClasses();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(`Failed to save class: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. 删除班级
  const handleDeleteClass = async (id: string, name: string) => {
    if (window.confirm(`Delete class "${name}"? This action cannot be undone.`)) {
      try {
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) throw error;
        setClasses(classes.filter(c => c.id !== id));
      } catch (error: any) {
        alert(`Failed to delete class: ${error.message}`);
      }
    }
  };

  const openEditModal = (cls: any) => {
    setEditingId(cls.id);
    setClassForm({
      name: cls.name, skillLevel: cls.skill_level, venue: cls.venue || '',
      dayOfWeek: cls.day_of_week || 'Saturday', startTime: cls.start_time?.substring(0, 5) || '08:00',
      endTime: cls.end_time?.substring(0, 5) || '10:00', monthlyFee: cls.monthly_fee?.toString() || '',
      capacity: cls.capacity || 20
    });
    setIsModalOpen(true);
  };

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hourString, minute] = time24.split(':');
    const hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${minute} ${ampm}`;
  };

  if (!isMounted) return <div className="h-full flex items-center justify-center"><p className="text-gray-400 font-bold">Loading...</p></div>;

  return (
    <div className="bg-gray-50 min-h-full pb-10">
      <header className="bg-blue-600 text-white p-4 pt-safe pb-6 rounded-b-[2.5rem] shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4 mt-2">
          <h1 className="text-2xl font-black">Classes</h1>
          <button onClick={() => { setEditingId(null); setClassForm(DEFAULT_CLASS); setIsModalOpen(true); }} className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-1 shadow-sm active:scale-95 transition-all">
            <Plus size={16} /><span>Create Class</span>
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-blue-200" />
          <input type="text" placeholder="Search classes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-blue-700/50 text-white placeholder-blue-200 rounded-2xl pl-11 pr-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-white border border-blue-500/30 backdrop-blur-sm" />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
             <p className="text-sm font-bold text-gray-500">Syncing with Cloud...</p>
           </div>
        ) : (
          <>
            {filteredClasses.map((cls) => {
              const enrolledCount = enrolledCounts[cls.id] || 0;
              const isFull = enrolledCount >= (cls.capacity || 20);
              
              return (
                <div key={cls.id} onClick={() => openEditModal(cls)} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer relative overflow-hidden">
                  
                  {/* 右上角操作区 */}
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(cls); }} className="p-1.5 text-gray-300 hover:text-blue-500 bg-gray-50 rounded-lg"><Edit3 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id, cls.name); }} className="p-1.5 text-gray-300 hover:text-red-500 bg-gray-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>

                  <div className="pr-16">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{cls.skill_level}</p>
                    <h3 className="font-black text-xl text-gray-900 mb-3">{cls.name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 font-bold"><CalendarDays size={16} className="mr-2.5 text-blue-500" />{cls.day_of_week}</div>
                      <div className="flex items-center text-sm text-gray-600 font-bold"><Clock size={16} className="mr-2.5 text-blue-500" />{formatTime12h(cls.start_time)} - {formatTime12h(cls.end_time)}</div>
                      {cls.venue && <div className="flex items-center text-sm text-gray-600 font-bold"><MapPin size={16} className="mr-2.5 text-blue-500" />{cls.venue}</div>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-1.5">
                      <Users size={16} className={isFull ? "text-red-500" : "text-green-500"} />
                      <span className={`text-xs font-black ${isFull ? "text-red-600" : "text-gray-500"}`}>
                        {enrolledCount} / {cls.capacity || 20} Students
                      </span>
                    </div>
                    <div className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-100/50">
                      <span className="font-black text-green-700">RM {cls.monthly_fee}</span><span className="text-[9px] text-green-600/70 font-bold ml-1 uppercase">/mth</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredClasses.length === 0 && <div className="text-center py-10 text-gray-400 font-bold text-sm">No classes created yet.</div>}
          </>
        )}
      </div>

      {/* 新增/编辑班级的弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl flex flex-col h-[85vh] animate-in slide-in-from-bottom-5">
            <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-center">
              <h3 className="font-black text-2xl text-gray-900">{editingId ? 'Edit Class' : 'Create Class'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 text-gray-400 rounded-full p-2.5 active:bg-gray-200"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 pb-20">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Class Name <span className="text-red-500">*</span></label>
                <input type="text" value={classForm.name} onChange={(e) => setClassForm({...classForm, name: e.target.value})} placeholder="e.g. U12 Foundation" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Skill Level</label>
                  <select value={classForm.skillLevel} onChange={(e) => setClassForm({...classForm, skillLevel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 outline-none">
                    <option value="Foundation">Foundation</option>
                    <option value="Development">Development</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Competition">Competition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Max Capacity</label>
                  <input type="number" value={classForm.capacity} onChange={(e) => setClassForm({...classForm, capacity: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center"><DollarSign size={12} className="mr-1"/> Monthly Fee (RM) <span className="text-red-500 ml-1">*</span></label>
                <input type="number" placeholder="120" value={classForm.monthlyFee} onChange={(e) => setClassForm({...classForm, monthlyFee: e.target.value})} className="w-full bg-green-50 border border-green-200 rounded-2xl px-4 py-3.5 font-black text-[18px] text-green-700 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2">Schedule & Location</h4>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Day of Week</label>
                  <select value={classForm.dayOfWeek} onChange={(e) => setClassForm({...classForm, dayOfWeek: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none">
                    <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option><option value="Friday">Friday</option><option value="Saturday">Saturday</option><option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Time</label>
                    <input type="time" value={classForm.startTime} onChange={(e) => setClassForm({...classForm, startTime: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">End Time</label>
                    <input type="time" value={classForm.endTime} onChange={(e) => setClassForm({...classForm, endTime: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Venue</label>
                  <input type="text" placeholder="e.g. Court A" value={classForm.venue} onChange={(e) => setClassForm({...classForm, venue: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                </div>
              </div>
            </div>

            <div className="p-6 pb-safe border-t border-gray-100 shrink-0 bg-white">
              <button onClick={handleSaveClass} disabled={isSaving} className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-2xl active:bg-blue-700 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">
                {isSaving ? 'Saving...' : (editingId ? 'Save Class Changes' : 'Create Class')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
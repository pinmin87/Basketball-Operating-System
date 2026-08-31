'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Clock, Users, CalendarDays, Edit3, Trash2, Loader2, DollarSign, X, UserPlus, UserMinus, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TypeScript 接口定义 ---
interface Schedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface ClassData {
  id?: string;
  name: string;
  skillLevel: string;
  venue: string;
  monthlyFee: string | number;
  capacity: number;
  schedules: Schedule[];
}

interface Player {
  id: string | number;
  name: string;
  parent_phone: string | null;
}

const DEFAULT_CLASS: ClassData = { 
  name: '', 
  skillLevel: 'Foundation', 
  venue: '', 
  monthlyFee: '', 
  capacity: 20,
  schedules: [{ dayOfWeek: 'Saturday', startTime: '08:00', endTime: '10:00' }]
};

export default function ClassesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [academyId, setAcademyId] = useState<string | null>(null);

  // 列表与状态
  const [classes, setClasses] = useState<any[]>([]);
  const [enrolledCounts, setEnrolledCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // 课程表单 Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState<ClassData>(DEFAULT_CLASS);
  const [isSaving, setIsSaving] = useState(false);

  // 球员管理 Modal
  const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);
  const [currentManageClass, setCurrentManageClass] = useState<any>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [classPlayers, setClassPlayers] = useState<string[]>([]); 
  const [draftClassPlayers, setDraftClassPlayers] = useState<string[]>([]); 
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [isSavingPlayers, setIsSavingPlayers] = useState(false);
  const [isFetchingModalData, setIsFetchingModalData] = useState(false); 

  useEffect(() => {
    setIsMounted(true);
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', session.user.id).single();
      const currentAcademyId = profile?.academy_id;

      if (currentAcademyId) {
        setAcademyId(currentAcademyId);
        
        // 并行请求以提升加载速度
        const [classesResponse, enrollmentResponse] = await Promise.all([
          supabase.from('classes').select('*').eq('academy_id', currentAcademyId).order('created_at', { ascending: false }),
          supabase.from('player_class').select('class_id, status').eq('academy_id', currentAcademyId)
        ]);

        if (classesResponse.error) throw classesResponse.error;
        setClasses(classesResponse.data || []);

        if (enrollmentResponse.data) {
          const counts: Record<string, number> = {};
          enrollmentResponse.data.forEach((row: any) => {
            if (row.status && String(row.status).trim().toUpperCase() === 'ACTIVE') {
              counts[row.class_id] = (counts[row.class_id] || 0) + 1;
            }
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

  const handleAddSession = () => {
    setClassForm((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { dayOfWeek: 'Sunday', startTime: '08:00', endTime: '10:00' }]
    }));
  };

  const handleRemoveSession = (indexToRemove: number) => {
    setClassForm((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSessionChange = (index: number, field: keyof Schedule, value: string) => {
    setClassForm((prev) => {
      const newSchedules = [...prev.schedules];
      newSchedules[index] = { ...newSchedules[index], [field]: value };
      return { ...prev, schedules: newSchedules };
    });
  };

  const handleSaveClass = async () => {
    if (!classForm.name || !classForm.monthlyFee) {
      return alert('Class Name and Monthly Fee are required!');
    }
    if (!academyId) return alert('Authentication Error. Please re-login.');

    setIsSaving(true);
    const payload = {
      academy_id: academyId,
      name: classForm.name,
      skill_level: classForm.skillLevel,
      venue: classForm.venue,
      monthly_fee: Number(classForm.monthlyFee),
      capacity: Number(classForm.capacity),
      schedules: classForm.schedules, 
      day_of_week: null, 
      start_time: null, 
      end_time: null, 
      day_of_week_2: null, 
      start_time_2: null, 
      end_time_2: null
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('classes').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('classes').insert([payload]);
        if (error) throw error;
      }
      await fetchClasses();
      setIsModalOpen(false);
    } catch (error: any) {
      alert(`Failed to save class: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete class "${name}"?`)) {
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
    let loadedSchedules: Schedule[] = cls.schedules || [];
    
    // 兼容旧数据库结构的平滑过渡
    if (!loadedSchedules.length) {
      if (cls.day_of_week) {
        loadedSchedules.push({
          dayOfWeek: cls.day_of_week,
          startTime: cls.start_time?.substring(0, 5) || '08:00',
          endTime: cls.end_time?.substring(0, 5) || '10:00'
        });
      }
      if (cls.day_of_week_2) {
        loadedSchedules.push({
          dayOfWeek: cls.day_of_week_2,
          startTime: cls.start_time_2?.substring(0, 5) || '08:00',
          endTime: cls.end_time_2?.substring(0, 5) || '10:00'
        });
      }
      if (loadedSchedules.length === 0) {
        loadedSchedules = [{ dayOfWeek: 'Saturday', startTime: '08:00', endTime: '10:00' }];
      }
    }

    setClassForm({
      name: cls.name, 
      skillLevel: cls.skill_level, 
      venue: cls.venue || '',
      monthlyFee: cls.monthly_fee?.toString() || '',
      capacity: cls.capacity || 20,
      schedules: loadedSchedules
    });
    setIsModalOpen(true);
  };

  const openManagePlayersModal = async (cls: any) => {
    setCurrentManageClass(cls);
    setIsManagePlayersOpen(true);
    setPlayerSearchQuery('');
    setIsFetchingModalData(true); 
    setDraftClassPlayers([]); 
    setClassPlayers([]); 

    if (!academyId) {
      setIsFetchingModalData(false);
      return;
    }

    try {
      const [playersData, enrollmentData] = await Promise.all([
        supabase.from('players').select('id, name, parent_phone').eq('academy_id', academyId).eq('status', 'ACTIVE').order('name'),
        supabase.from('player_class').select('player_id, status').eq('class_id', cls.id)
      ]);

      setAllPlayers(playersData.data || []);
      
      const enrolledIds = enrollmentData.data 
        ? enrollmentData.data.filter(e => e.status && String(e.status).trim().toUpperCase() === 'ACTIVE').map(e => String(e.player_id)) 
        : [];
      
      setClassPlayers(enrolledIds);
      setDraftClassPlayers(enrolledIds);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsFetchingModalData(false); 
    }
  };

  const togglePlayerDraft = (playerId: string | number, isCurrentlyEnrolled: boolean) => {
    const strId = String(playerId);
    if (isCurrentlyEnrolled) {
      setDraftClassPlayers(prev => prev.filter(id => id !== strId));
    } else {
      setDraftClassPlayers(prev => [...prev, strId]);
    }
  };

  // 差量同步策略：只更新变动的球员数据
  const handleSavePlayers = async () => {
    if (!currentManageClass || !academyId) return;
    setIsSavingPlayers(true);
    const classId = currentManageClass.id;

    const currentClassPlayerIds = classPlayers.map(String);
    const newDraftIds = draftClassPlayers.map(String);

    const playersToDeactivate = currentClassPlayerIds.filter(id => !newDraftIds.includes(id));
    const playersToActivate = newDraftIds.filter(id => !currentClassPlayerIds.includes(id));

    try {
      // 1. 移除球员 (软删除，更新 status 为 INACTIVE)
      for (const pid of playersToDeactivate) {
        const { error } = await supabase
          .from('player_class')
          .update({ status: 'INACTIVE' })
          .eq('player_id', pid)
          .eq('class_id', classId);
        
        if (error) throw new Error(`Failed to remove player: ${error.message}`);
      }

      // 2. 添加球员 (激活已存在的或插入新的)
      for (const pid of playersToActivate) {
        const { data: existingRecords, error: checkErr } = await supabase
          .from('player_class')
          .select('id')
          .eq('player_id', pid)
          .eq('class_id', classId)
          .limit(1);

        if (checkErr) throw new Error(`Fetch check error: ${checkErr.message}`);

        if (existingRecords && existingRecords.length > 0) {
          const { error: updErr } = await supabase
            .from('player_class')
            .update({ status: 'ACTIVE' })
            .eq('id', existingRecords[0].id);
          
          if (updErr) throw new Error(`Update error: ${updErr.message}`);
        } else {
          const { error: insErr } = await supabase
            .from('player_class')
            .insert([{ 
              academy_id: academyId, 
              player_id: pid, 
              class_id: classId, 
              status: 'ACTIVE' 
            }]);
          
          if (insErr) throw new Error(`Insert error: ${insErr.message}`);
        }
      }

      setClassPlayers(newDraftIds);
      setIsManagePlayersOpen(false);
      
      await fetchClasses(); // 刷新总人数
      alert('Players updated successfully!');

    } catch (error: any) {
      console.error('Database Sync Error:', error);
      alert(`Error saving changes: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSavingPlayers(false);
    }
  };

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hourString, minute] = time24.split(':');
    const hour = parseInt(hourString, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${minute} ${ampm}`;
  };

  const renderSchedulesForCard = (cls: any) => {
    let schedulesToRender: Schedule[] = [];
    
    if (cls.schedules && cls.schedules.length > 0) {
      schedulesToRender = cls.schedules;
    } else {
      if (cls.day_of_week) {
        schedulesToRender.push({ dayOfWeek: cls.day_of_week, startTime: cls.start_time, endTime: cls.end_time });
      }
      if (cls.day_of_week_2) {
        schedulesToRender.push({ dayOfWeek: cls.day_of_week_2, startTime: cls.start_time_2, endTime: cls.end_time_2 });
      }
    }

    if (schedulesToRender.length === 0) return <div className="text-xs text-gray-400 font-bold">No schedule</div>;
      
    return schedulesToRender.map((s, idx) => {
      if (!s.dayOfWeek) return null;
      return (
        <div key={idx} className={`flex flex-col ${idx > 0 ? 'pt-2 border-t border-gray-200/50 mt-2' : ''}`}>
          <div className={`flex items-center text-[13px] font-bold ${idx > 0 ? 'text-indigo-600' : 'text-gray-800'}`}>
            <CalendarDays size={14} className={`mr-2 ${idx > 0 ? 'text-indigo-500' : 'text-blue-500'}`} />{s.dayOfWeek}
          </div>
          <div className="flex items-center text-[12px] text-gray-500 font-bold ml-5">
            <Clock size={12} className="mr-1.5 opacity-50" />{formatTime12h(s.startTime)} - {formatTime12h(s.endTime)}
          </div>
        </div>
      );
    });
  };

  if (!isMounted) return <div className="h-full flex items-center justify-center"><p className="text-gray-400 font-bold">Loading...</p></div>;

  const filteredModalPlayers = allPlayers.filter(p => 
    p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) || 
    (p.parent_phone && p.parent_phone.includes(playerSearchQuery))
  );

  const enrolledModalPlayers = filteredModalPlayers.filter(p => draftClassPlayers.includes(String(p.id)));
  const availableModalPlayers = filteredModalPlayers.filter(p => !draftClassPlayers.includes(String(p.id)));

  return (
    <div className="bg-gray-50 min-h-full pb-10">
      {/* 头部搜索与导航 */}
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

      {/* 课程列表区 */}
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
                <div key={cls.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(cls); }} className="p-1.5 text-gray-300 hover:text-blue-500 bg-gray-50 rounded-lg"><Edit3 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls.id, cls.name); }} className="p-1.5 text-gray-300 hover:text-red-500 bg-gray-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>

                  <div className="pr-16 mb-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{cls.skill_level}</p>
                    <h3 className="font-black text-xl text-gray-900 mb-3">{cls.name}</h3>
                    
                    <div className="space-y-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                      {renderSchedulesForCard(cls)}
                      {cls.venue && <div className="flex items-center text-[12px] text-gray-500 font-bold mt-2 pt-2 border-t border-gray-200/50"><MapPin size={12} className="mr-2 text-gray-400" />{cls.venue}</div>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <button onClick={() => openManagePlayersModal(cls)} className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 px-3 py-2 rounded-xl transition-colors">
                      <Users size={16} className={isFull ? "text-red-500" : "text-blue-500"} />
                      <span className={`text-xs font-black ${isFull ? "text-red-600" : "text-blue-700"}`}>{enrolledCount} / {cls.capacity || 20} Players</span>
                    </button>
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

      {/* MANAGE PLAYERS MODAL */}
      {isManagePlayersOpen && currentManageClass && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-end justify-center">
          <div className="bg-gray-50 w-full max-w-md rounded-t-[2.5rem] shadow-2xl flex flex-col h-[90vh] animate-in slide-in-from-bottom-5">
            <div className="p-6 border-b border-gray-200 shrink-0 bg-white rounded-t-[2.5rem]">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-black text-2xl text-gray-900">Manage Players</h3>
                  <p className="text-sm font-bold text-blue-600 mt-1">{currentManageClass.name}</p>
                </div>
                <button onClick={() => setIsManagePlayersOpen(false)} className="bg-gray-100 text-gray-400 rounded-full p-2.5 active:bg-gray-200"><X size={20} /></button>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
                <input type="text" placeholder="Search players by name or phone..." value={playerSearchQuery} onChange={(e) => setPlayerSearchQuery(e.target.value)} className="w-full bg-gray-100 text-gray-900 placeholder-gray-400 rounded-2xl pl-11 pr-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-6">
              {isFetchingModalData ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
                  <p className="text-xs font-bold text-gray-500">Loading players...</p>
                </div>
              ) : filteredModalPlayers.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 font-bold text-sm">No players found.</div>
              ) : (
                <>
                  {enrolledModalPlayers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Added Players ({enrolledModalPlayers.length})</h4>
                      {enrolledModalPlayers.map(player => (
                        <div key={player.id} className="bg-blue-50/50 p-4 rounded-2xl shadow-sm border border-blue-100 flex justify-between items-center animate-in fade-in zoom-in-95 duration-200">
                          <div>
                            <p className="font-black text-gray-900 text-[16px]">{player.name}</p>
                            <p className="text-xs font-bold text-gray-500 mt-0.5">{player.parent_phone || 'No Phone'}</p>
                          </div>
                          <button onClick={() => togglePlayerDraft(player.id, true)} className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 bg-white text-red-500 border border-red-100 hover:bg-red-50 shadow-sm">
                            <UserMinus size={16} /><span>Remove</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {availableModalPlayers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Available Players ({availableModalPlayers.length})</h4>
                      {availableModalPlayers.map(player => (
                        <div key={player.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center animate-in fade-in zoom-in-95 duration-200">
                          <div>
                            <p className="font-black text-gray-900 text-[16px]">{player.name}</p>
                            <p className="text-xs font-bold text-gray-400 mt-0.5">{player.parent_phone || 'No Phone'}</p>
                          </div>
                          <button onClick={() => togglePlayerDraft(player.id, false)} className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 bg-blue-600 text-white shadow-md hover:bg-blue-700">
                            <UserPlus size={16} /><span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 pb-safe border-t border-gray-100 shrink-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <button 
                onClick={handleSavePlayers} 
                disabled={isSavingPlayers || isFetchingModalData} 
                className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-2xl flex items-center justify-center space-x-2 active:bg-blue-700 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingPlayers ? <Loader2 size={24} className="animate-spin" /> : <Save size={20} />}
                <span>{isSavingPlayers ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLASS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl flex flex-col h-[90vh] animate-in slide-in-from-bottom-5">
            <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-center">
              <h3 className="font-black text-2xl text-gray-900">{editingId ? 'Edit Class' : 'Create Class'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 text-gray-400 rounded-full p-2.5 active:bg-gray-200"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 pb-20">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Class Name <span className="text-red-500">*</span></label>
                <input type="text" value={classForm.name} onChange={(e) => setClassForm({...classForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Skill Level</label>
                  <select value={classForm.skillLevel} onChange={(e) => setClassForm({...classForm, skillLevel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 outline-none">
                    <option value="Foundation">Foundation</option><option value="Development">Development</option><option value="Advanced">Advanced</option><option value="Competition">Competition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Capacity</label>
                  <input type="number" value={classForm.capacity} onChange={(e) => setClassForm({...classForm, capacity: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center"><DollarSign size={12} className="mr-1"/> Monthly Fee (RM) <span className="text-red-500 ml-1">*</span></label>
                <input type="number" value={classForm.monthlyFee} onChange={(e) => setClassForm({...classForm, monthlyFee: e.target.value})} className="w-full bg-green-50 border border-green-200 rounded-2xl px-4 py-3.5 font-black text-[18px] text-green-700 focus:ring-2 focus:ring-green-500 outline-none" />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Venue</label>
                <input type="text" value={classForm.venue} onChange={(e) => setClassForm({...classForm, venue: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 outline-none" />
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2">Training Schedules</h4>
                {classForm.schedules.map((session, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4 relative">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <h4 className={`text-[11px] font-black uppercase tracking-widest ${index > 0 ? 'text-indigo-500' : 'text-blue-500'}`}>Session {index + 1}</h4>
                      {classForm.schedules.length > 1 && (
                        <button type="button" onClick={() => handleRemoveSession(index)} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-md">Remove</button>
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Day of Week</label>
                      <select value={session.dayOfWeek} onChange={(e) => handleSessionChange(index, 'dayOfWeek', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none">
                        <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option><option value="Friday">Friday</option><option value="Saturday">Saturday</option><option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Time</label>
                        <input type="time" value={session.startTime} onChange={(e) => handleSessionChange(index, 'startTime', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">End Time</label>
                        <input type="time" value={session.endTime} onChange={(e) => handleSessionChange(index, 'endTime', e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={handleAddSession} className="w-full py-4 border-2 border-dashed border-gray-300 text-gray-500 rounded-2xl hover:border-blue-500 hover:text-blue-600 font-bold transition-colors flex items-center justify-center space-x-2 active:bg-gray-50">
                  <Plus size={18} /><span>Add Another Session</span>
                </button>
              </div>

            </div>
            <div className="p-6 pb-safe border-t border-gray-100 shrink-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <button onClick={handleSaveClass} disabled={isSaving} className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-2xl active:bg-blue-700 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex justify-center items-center">
                {isSaving ? <Loader2 size={24} className="animate-spin mr-2" /> : null}
                {isSaving ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Class')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
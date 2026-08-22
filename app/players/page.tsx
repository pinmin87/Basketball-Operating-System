'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Plus, User, Phone, X, Edit3, Wallet, Clock, CheckCircle2, XCircle, History, Mail, MapPin, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const formatTime = (time24: string) => {
  if (!time24) return '';
  const [hourString, minute] = time24.split(':');
  const hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${ampm}`;
};

const DEFAULT_PLAYER = { name: '', gender: 'Male', dob: '', parentName: '', parentPhone: '', email: '', address: '', status: 'ACTIVE' };

function PlayersContent() {
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  
  // 🚀 核心新增：存储当前老板的学院 ID
  const [academyId, setAcademyId] = useState<string | null>(null);

  // 数据状态
  const [players, setPlayers] = useState<any[]>([]);
  const [academyClasses, setAcademyClasses] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);

  // UI 交互状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [playerForm, setPlayerForm] = useState<any>(DEFAULT_PLAYER);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'CLASSES' | 'ATTENDANCE'>('PROFILE');
  const [isSaving, setIsSaving] = useState(false);

  // 1. 初始化数据：确认身份并拉取数据
  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 步骤 A：获取当前登录用户的 session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 步骤 B：查出该用户的 academy_id (多租户 SaaS 核心)
      const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', session.user.id).single();
      const currentAcademyId = profile?.academy_id;
      
      if (currentAcademyId) {
        setAcademyId(currentAcademyId);
        
        // 步骤 C：只拉取属于这个学院的球员
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('academy_id', currentAcademyId)
          .order('created_at', { ascending: false });

        if (playersError) throw playersError;
        
        if (playersData) {
          // 正确映射数据库字段
          setPlayers(playersData.map((p: any) => ({
            id: p.id,
            name: p.name,
            gender: p.gender,
            dob: p.dob,
            parentName: p.parent_name,
            parentPhone: p.parent_phone,
            email: p.email,
            address: p.address,
            status: p.status
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    // 本地缓存的平滑降级（Classes & Attendance）保持不变
    try {
      const savedClasses = localStorage.getItem('academy_classes');
      if (savedClasses) setAcademyClasses(JSON.parse(savedClasses));
      const savedAtt = localStorage.getItem('academy_attendance');
      if (savedAtt) setAttendances(JSON.parse(savedAtt));
    } catch (e) {
      console.log('Error loading local storage.');
    }
  };

  useEffect(() => {
    const autoAdd = searchParams.get('autoAdd');
    if (autoAdd === 'true' && isMounted) { 
      setEditingId(null); 
      setPlayerForm(DEFAULT_PLAYER); 
      setActiveTab('PROFILE'); 
      setIsModalOpen(true); 
    }
  }, [searchParams, isMounted]);

  const filteredPlayers = players.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.parentPhone?.includes(searchQuery));
  
  const openProfileModal = (player: any) => { setEditingId(player.id); setPlayerForm({ ...player }); setActiveTab('PROFILE'); setIsModalOpen(true); };

  // 🚀 2. 修复后的云端保存逻辑
  const handleSavePlayer = async () => {
    if (!playerForm.name || !playerForm.parentName || !playerForm.parentPhone) {
      return alert('Player Name and Parent Phone are required!');
    }
    if (!academyId) {
      return alert('Authentication error: Academy ID not found. Please log out and log in again.');
    }
    
    setIsSaving(true);

    // 完美匹配 Supabase 的字段要求
    const payload = {
      academy_id: academyId, // 必须携带此身份证
      name: playerForm.name,
      gender: playerForm.gender,
      dob: playerForm.dob || null, 
      parent_name: playerForm.parentName,
      parent_phone: playerForm.parentPhone,
      email: playerForm.email,
      address: playerForm.address,
      status: playerForm.status || 'ACTIVE'
    };

    try {
      if (editingId) {
        // Update 逻辑
        const { error } = await supabase.from('players').update(payload).eq('id', editingId);
        if (error) throw error;
        
        setPlayers(players.map(p => p.id === editingId ? { ...p, ...playerForm } : p));
        setIsModalOpen(false);
      } else {
        // Insert 逻辑
        const { data, error } = await supabase.from('players').insert([payload]).select().single();
        if (error) throw error;
        
        if (data) {
          setPlayers([{ id: data.id, ...playerForm, status: 'ACTIVE' }, ...players]);
          setIsModalOpen(false);
        }
      }
    } catch (error: any) {
      console.error('Database error:', error);
      alert(`Failed to save player: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 3. 安全删除功能
  const handleDeletePlayer = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete player "${name}"? This action cannot be undone.`)) {
      try {
        const { error } = await supabase.from('players').delete().eq('id', id);
        if (error) throw error;
        setPlayers(players.filter(p => p.id !== id));
      } catch (error: any) {
        alert(`Failed to delete player: ${error.message}`);
      }
    }
  };

  // ----- UI 及计算逻辑完美保留不变 -----
  const playerEnrolledClasses = editingId ? academyClasses.filter(c => c.enrolledPlayers?.some((p: any) => p.id === editingId)) : [];
  const totalMonthlyFee = playerEnrolledClasses.reduce((sum, cls) => sum + (Number(cls.monthlyFee) || 0), 0);

  let playerRawRecords: any[] = [];
  if (editingId) {
    attendances.forEach(att => {
      const pRecord = att.records.find((r: any) => r.playerId === editingId);
      if (pRecord) {
        const cls = academyClasses.find(c => c.id === att.classId);
        playerRawRecords.push({ date: att.date, className: cls?.name || 'Unknown Class', status: pRecord.status });
      }
    });
  }
  playerRawRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let attPresent = 0, attAbsent = 0, attLate = 0, attTotal = playerRawRecords.length;
  playerRawRecords.forEach(r => {
    if (r.status === 'PRESENT') attPresent++;
    if (r.status === 'ABSENT') attAbsent++;
    if (r.status === 'LATE') attLate++;
  });
  const attRate = attTotal === 0 ? 0 : Math.round((attPresent / attTotal) * 100);

  const getStatusStyle = (status: string) => {
    if (status === 'PRESENT') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'ABSENT') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'LATE') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (!isMounted) return <div className="h-full flex items-center justify-center"><p className="text-gray-400 font-bold">Loading...</p></div>;

  return (
    <div className="bg-gray-50 min-h-full pb-10">
      <header className="bg-blue-600 text-white p-4 pt-safe pb-6 rounded-b-[2.5rem] shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4 mt-2">
          <h1 className="text-2xl font-black">Players</h1>
          <button onClick={() => { setEditingId(null); setPlayerForm(DEFAULT_PLAYER); setActiveTab('PROFILE'); setIsModalOpen(true); }} className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-1 shadow-sm active:scale-95 transition-all"><Plus size={16} /><span>Add Player</span></button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-blue-200" />
          <input type="text" placeholder="Search player or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-blue-700/50 text-white placeholder-blue-200 rounded-2xl pl-11 pr-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-white border border-blue-500/30 backdrop-blur-sm" />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {filteredPlayers.map((player) => (
          <div key={player.id} onClick={() => openProfileModal(player)} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 active:scale-[0.99] transition-transform cursor-pointer relative">
            <div className="absolute top-5 right-5 flex items-center space-x-3">
               <button onClick={(e) => { e.stopPropagation(); openProfileModal(player); }} className="text-gray-300 hover:text-blue-500 transition-colors"><Edit3 size={18} /></button>
               <button onClick={(e) => { e.stopPropagation(); handleDeletePlayer(player.id, player.name); }} className="text-gray-300 hover:text-red-500 transition-colors" title="Delete Player"><Trash2 size={18} /></button>
            </div>
            <div className="flex items-start space-x-4 pr-14">
              <div className="bg-blue-50 p-4 rounded-full"><User size={24} className="text-blue-600" /></div>
              <div className="w-full">
                <p className="font-black text-blue-700 text-xl">{player.name}</p>
                <span className="inline-flex text-[10px] font-black px-2.5 py-1 rounded-md mb-2 mt-1.5 bg-green-100 text-green-700">{player.status}</span>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50 space-y-2">
                  <div className="flex justify-between items-center text-sm"><span className="text-gray-500 font-bold">Parent:</span><span className="font-bold text-gray-800">{player.parentName || 'N/A'}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-gray-500 font-bold">Phone:</span><span className="font-black text-blue-600 flex items-center"><Phone size={14} className="mr-1" />{player.parentPhone}</span></div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredPlayers.length === 0 && <div className="text-center py-10 text-gray-400 font-bold text-sm">No players found.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl flex flex-col h-[90vh] animate-in slide-in-from-bottom-5">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <div className="flex justify-between items-center mb-5">
                <div><h3 className="font-black text-2xl text-gray-900">{editingId ? playerForm.name : 'New Player'}</h3></div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white text-gray-400 rounded-full p-2.5 border border-gray-200 active:bg-gray-100"><X size={20} /></button>
              </div>
              {editingId && (
                <div className="flex space-x-6 border-b border-gray-100">
                  <button onClick={() => setActiveTab('PROFILE')} className={`pb-3 text-[15px] font-black transition-colors border-b-2 ${activeTab === 'PROFILE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>Profile</button>
                  <button onClick={() => setActiveTab('CLASSES')} className={`pb-3 text-[15px] font-black transition-colors border-b-2 ${activeTab === 'CLASSES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>Classes</button>
                  <button onClick={() => setActiveTab('ATTENDANCE')} className={`pb-3 text-[15px] font-black transition-colors border-b-2 ${activeTab === 'ATTENDANCE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}>Attendance</button>
                </div>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-6 pb-32">
              {activeTab === 'PROFILE' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest border-b border-gray-50 pb-2">Player Info</h4>
                    <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Player Name <span className="text-red-500">*</span></label><input type="text" value={playerForm.name} onChange={(e) => setPlayerForm({...playerForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Gender</label>
                        <select value={playerForm.gender} onChange={(e) => setPlayerForm({...playerForm, gender: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 outline-none appearance-none">
                          <option value="Male">Male</option><option value="Female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date of Birth</label>
                        <input type="date" value={playerForm.dob} onChange={(e) => setPlayerForm({...playerForm, dob: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                    <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest border-b border-gray-50 pb-2">Guardian Contact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Parent Name <span className="text-red-500">*</span></label><input type="text" value={playerForm.parentName} onChange={(e) => setPlayerForm({...playerForm, parentName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                      <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Parent Phone <span className="text-red-500">*</span></label><input type="tel" value={playerForm.parentPhone} onChange={(e) => setPlayerForm({...playerForm, parentPhone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    </div>
                    <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center"><Mail size={12} className="mr-1"/> Email</label><input type="email" placeholder="Optional" value={playerForm.email} onChange={(e) => setPlayerForm({...playerForm, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                    <div><label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 flex items-center"><MapPin size={12} className="mr-1"/> Home Address</label><textarea rows={2} placeholder="Optional" value={playerForm.address} onChange={(e) => setPlayerForm({...playerForm, address: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  </div>
                </div>
              )}

              {activeTab === 'CLASSES' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2rem] p-6 text-white shadow-lg">
                    <p className="text-green-100 text-[11px] font-black uppercase tracking-widest mb-1">Total Monthly Fee</p>
                    <div className="flex items-center space-x-2"><Wallet size={28} className="text-green-200" /><span className="text-4xl font-black">RM {totalMonthlyFee}</span></div>
                  </div>
                  {playerEnrolledClasses.map((cls: any) => (
                    <div key={cls.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100"><h4 className="font-black text-lg">{cls.name}</h4><span className="font-black text-green-600 text-lg">RM {cls.monthlyFee}</span></div>
                  ))}
                  {playerEnrolledClasses.length === 0 && <div className="text-center py-6 text-gray-400 font-bold text-sm">Not enrolled in any classes.</div>}
                </div>
              )}

              {activeTab === 'ATTENDANCE' && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center relative">
                    <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 mb-4 ${attRate >= 80 ? 'border-green-500 bg-green-50 text-green-600' : 'border-orange-400 bg-orange-50 text-orange-600'}`}>
                      <span className="text-4xl font-black">{attTotal > 0 ? `${attRate}%` : '--'}</span>
                    </div>
                    <h4 className="font-black text-gray-900 text-lg">Attendance Rate</h4>
                    <p className="text-sm text-gray-500 mt-1 font-bold">Based on <span className="text-gray-900">{attTotal}</span> total sessions</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center"><CheckCircle2 size={24} className="mx-auto text-green-500 mb-2" /><p className="text-2xl font-black text-gray-900">{attPresent}</p><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Present</p></div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center"><XCircle size={24} className="mx-auto text-red-500 mb-2" /><p className="text-2xl font-black text-gray-900">{attAbsent}</p><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Absent</p></div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 text-center"><Clock size={24} className="mx-auto text-orange-500 mb-2" /><p className="text-2xl font-black text-gray-900">{attLate}</p><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Late</p></div>
                  </div>
                  <div>
                    <h4 className="flex items-center text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 mt-6"><History size={16} className="mr-2" /> Recent Sessions</h4>
                    <div className="space-y-3">
                      {playerRawRecords.length === 0 ? <p className="text-gray-400 text-sm font-bold text-center py-4">No records found.</p> : playerRawRecords.map((record: any, idx: number) => (
                        <div key={idx} className={`flex justify-between items-center p-4 rounded-2xl border ${getStatusStyle(record.status)}`}>
                          <div><p className="text-base font-black">{record.date}</p><p className="text-[11px] uppercase font-black tracking-widest opacity-80 mt-1">{record.className}</p></div>
                          <div className="font-black text-sm px-3 py-1.5 bg-white/50 rounded-lg">{record.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pb-12 border-t border-gray-100 shrink-0 bg-white">
              <button 
                type="button" 
                onClick={handleSavePlayer} 
                disabled={isSaving}
                className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-2xl active:bg-blue-700 shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : (editingId ? 'Save Changes' : 'Confirm & Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayersPage() { return <Suspense fallback={<div>Loading...</div>}><PlayersContent /></Suspense>; }
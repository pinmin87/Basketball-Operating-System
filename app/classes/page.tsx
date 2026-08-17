'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Plus, Users, Calendar, MapPin, Wallet, X, UserPlus, Trash2, Clock, CheckCircle2 } from 'lucide-react';

const formatTime = (time24: string) => {
  if (!time24) return '';
  const [hourString, minute] = time24.split(':');
  const hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${ampm}`;
};

const DEFAULT_CLASS = { name: '', skillLevel: 'Foundation', venue: '', dayOfWeek: 'Saturday', startTime: '09:00', endTime: '11:00', monthlyFee: '' };

function ClassesContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [globalPlayers, setGlobalPlayers] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const savedPlayers = localStorage.getItem('academy_players');
    if (savedPlayers) try { setGlobalPlayers(JSON.parse(savedPlayers)); } catch (e) {}

    const savedClasses = localStorage.getItem('academy_classes');
    if (savedClasses) {
      try { setClasses(JSON.parse(savedClasses)); } catch (e) {}
    } else {
      setClasses([
        { id: 'c1', name: 'U10 Foundation', skillLevel: 'Foundation', venue: 'Main Court', dayOfWeek: 'Saturday', startTime: '09:00', endTime: '11:00', monthlyFee: 120, enrolledPlayers: [] },
      ]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('academy_classes', JSON.stringify(classes));
  }, [classes, isMounted]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState<any>(DEFAULT_CLASS);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [playerSearch, setPlayerSearch] = useState('');

  const filteredClasses = classes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSaveClass = () => {
    if (!classForm.name || !classForm.monthlyFee) return alert('Class Name and Fee are required!');
    if (editingId) {
      setClasses(classes.map(c => c.id === editingId ? { ...c, ...classForm } : c));
    } else {
      setClasses([{ id: `c${Date.now()}`, ...classForm, enrolledPlayers: [] }, ...classes]);
    }
    setIsModalOpen(false);
  };

  const openManagePlayers = (cls: any) => { setSelectedClass(cls); setPlayerSearch(''); setIsManagePlayersOpen(true); };

  const handleAddPlayerToClass = (player: any) => {
    const updatedClasses = classes.map(c => {
      if (c.id === selectedClass.id) {
        const currentEnrolled = c.enrolledPlayers || [];
        if (!currentEnrolled.some((p: any) => p.id === player.id)) {
          const updatedEnrolled = [...currentEnrolled, { id: player.id, name: player.name, phone: player.parentPhone }];
          setSelectedClass({ ...c, enrolledPlayers: updatedEnrolled });
          return { ...c, enrolledPlayers: updatedEnrolled };
        }
      }
      return c;
    });
    setClasses(updatedClasses);
  };

  const handleRemovePlayerFromClass = (playerId: string) => {
    const updatedClasses = classes.map(c => {
      if (c.id === selectedClass.id) {
        const updatedEnrolled = (c.enrolledPlayers || []).filter((p: any) => p.id !== playerId);
        setSelectedClass({ ...c, enrolledPlayers: updatedEnrolled });
        return { ...c, enrolledPlayers: updatedEnrolled };
      }
      return c;
    });
    setClasses(updatedClasses);
  };

  const availablePlayers = globalPlayers.filter(gp => {
    const isAlreadyEnrolled = selectedClass?.enrolledPlayers?.some((ep: any) => ep.id === gp.id);
    const matchesSearch = gp.name.toLowerCase().includes(playerSearch.toLowerCase()) || gp.parentPhone.includes(playerSearch);
    return !isAlreadyEnrolled && matchesSearch;
  });

  if (!isMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-32"><p className="text-gray-400 font-bold animate-pulse">Loading Classes...</p></div>;

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <header className="bg-blue-600 text-white p-4 pt-safe pb-6 rounded-b-[2rem] shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black">Classes</h1>
          <button onClick={() => { setEditingId(null); setClassForm(DEFAULT_CLASS); setIsModalOpen(true); }} className="bg-white text-blue-600 font-bold px-3 py-2 rounded-xl text-sm flex items-center space-x-1 shadow-sm active:scale-95 transition-all">
            <Plus size={16} /><span>Add Class</span>
          </button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3.5 text-blue-200" />
          <input type="text" placeholder="Search classes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-blue-700/50 text-white placeholder-blue-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white border border-blue-500/30 backdrop-blur-sm" />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold bg-white rounded-3xl border border-gray-100 shadow-sm">No classes found.</div>
        ) : (
          filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-black text-gray-900 text-lg">{cls.name}</h3>
                  <span className="inline-flex text-[10px] font-black px-2 py-0.5 rounded-md mt-1 bg-blue-50 text-blue-600 uppercase tracking-wider">{cls.skillLevel}</span>
                </div>
                <div className="bg-green-50 px-2 py-1 rounded-lg border border-green-100 text-center">
                  <span className="text-[9px] font-bold text-green-600 block uppercase tracking-wider">Fee</span>
                  <span className="font-black text-green-700 text-sm">RM {cls.monthlyFee}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                <div className="flex items-center text-xs text-gray-600 font-bold"><Calendar size={14} className="mr-1.5 text-blue-500" />{cls.dayOfWeek}</div>
                <div className="flex items-center text-xs text-gray-600 font-bold"><Clock size={14} className="mr-1.5 text-blue-500" />{formatTime(cls.startTime)} - {formatTime(cls.endTime)}</div>
                <div className="flex items-center text-xs text-gray-600 font-bold col-span-2"><MapPin size={14} className="mr-1.5 text-blue-500" />{cls.venue || 'TBA'}</div>
              </div>

              <div className="flex space-x-2">
                <button onClick={() => openManagePlayers(cls)} className="flex-1 bg-blue-50 text-blue-700 font-bold py-3 rounded-xl text-sm flex justify-center items-center active:bg-blue-100 transition-colors">
                  <Users size={16} className="mr-2" />
                  Manage Players ({cls.enrolledPlayers?.length || 0})
                </button>
                <button onClick={() => { setEditingId(cls.id); setClassForm(cls); setIsModalOpen(true); }} className="px-4 bg-gray-50 text-gray-600 font-bold rounded-xl text-sm active:bg-gray-100 border border-gray-200">
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 弹窗：管理班级球员 (修复了滚动问题) */}
      {isManagePlayersOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* 这里的 flex flex-col h-[85vh] 保证了弹窗内部可以独立滚动 */}
          <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col h-[85vh] animate-in slide-in-from-bottom-5">
            {/* Header: 固定在顶部 */}
            <div className="p-5 border-b border-gray-100 shrink-0 flex justify-between items-center bg-gray-50 rounded-t-[2rem]">
              <div>
                <h3 className="font-black text-lg text-gray-900">{selectedClass.name}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Manage Enrolled Players</p>
              </div>
              <button onClick={() => setIsManagePlayersOpen(false)} className="bg-white text-gray-400 rounded-full p-2 border border-gray-200 active:bg-gray-100"><X size={18} /></button>
            </div>
            
            {/* Body: 设为 overflow-y-auto 允许顺滑滚动 */}
            <div className="flex-1 overflow-y-auto p-5 bg-white pb-24">
              <div className="mb-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Enrolled ({selectedClass.enrolledPlayers?.length || 0})</h4>
                <div className="space-y-2">
                  {(!selectedClass.enrolledPlayers || selectedClass.enrolledPlayers.length === 0) ? (
                    <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 text-xs font-bold">No players enrolled yet.</div>
                  ) : (
                    selectedClass.enrolledPlayers.map((ep: any) => (
                      <div key={ep.id} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center"><div className="bg-blue-100 p-1.5 rounded-full mr-3"><CheckCircle2 size={16} className="text-blue-600" /></div><div><p className="text-sm font-bold text-gray-900">{ep.name}</p></div></div>
                        <button onClick={() => handleRemovePlayerFromClass(ep.id)} className="text-red-400 p-2 hover:bg-red-50 rounded-full transition-colors active:scale-95"><Trash2 size={16} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <hr className="border-gray-100 mb-6" />

              <div>
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-3 flex items-center"><UserPlus size={14} className="mr-1" /> Add from Player Database</h4>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder="Search by name or phone..." value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  {availablePlayers.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs font-bold">No available players found.</div>
                  ) : (
                    availablePlayers.map(player => (
                      <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                        <div><p className="text-sm font-bold text-gray-900">{player.name}</p><p className="text-[10px] text-gray-500 font-medium mt-0.5">{player.parentPhone}</p></div>
                        <button onClick={() => handleAddPlayerToClass(player)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold active:bg-blue-700 active:scale-95 shadow-sm">Add</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗：编辑/新增班级完整表单 (找回了所有的详细输入框) */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
             <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5">
                 {/* 头部 */}
                 <div className="p-5 border-b border-gray-100 shrink-0 flex justify-between items-center bg-gray-50 rounded-t-[2rem]">
                    <h3 className="font-black text-xl text-gray-900">{editingId ? 'Edit Class' : 'Create New Class'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="bg-white text-gray-400 rounded-full p-2 border border-gray-200 active:bg-gray-100"><X size={18} /></button>
                 </div>
                 
                 {/* 身体区：可滚动 */}
                 <div className="p-6 overflow-y-auto space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Class Name <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="e.g. U10 Foundation" value={classForm.name} onChange={e=>setClassForm({...classForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Skill Level</label>
                        <select value={classForm.skillLevel} onChange={e=>setClassForm({...classForm, skillLevel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="Foundation">Foundation</option>
                          <option value="Development">Development</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Elite">Elite</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Monthly Fee (RM) <span className="text-red-500">*</span></label>
                        <input type="number" placeholder="e.g. 150" value={classForm.monthlyFee} onChange={e=>setClassForm({...classForm, monthlyFee: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Venue</label>
                      <input type="text" placeholder="e.g. Main Court A" value={classForm.venue} onChange={e=>setClassForm({...classForm, venue: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-3 ml-1">Schedule</label>
                      <select value={classForm.dayOfWeek} onChange={e=>setClassForm({...classForm, dayOfWeek: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 font-bold text-sm text-blue-900 mb-3 outline-none">
                        <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option><option value="Friday">Friday</option><option value="Saturday">Saturday</option><option value="Sunday">Sunday</option>
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-blue-500 mb-1">Start Time</label>
                          <input type="time" value={classForm.startTime} onChange={e=>setClassForm({...classForm, startTime: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 font-bold text-sm outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-blue-500 mb-1">End Time</label>
                          <input type="time" value={classForm.endTime} onChange={e=>setClassForm({...classForm, endTime: e.target.value})} className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 font-bold text-sm outline-none" />
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* 底部按钮 */}
                 <div className="p-5 border-t border-gray-100 shrink-0 bg-white rounded-b-[2rem]">
                     <button onClick={handleSaveClass} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl active:bg-blue-700 shadow-md">
                       Save Class
                     </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}

export default function ClassesPage() { return <main className="min-h-screen bg-gray-50"><Suspense fallback={<div className="p-4 flex justify-center text-gray-400 font-bold">Loading...</div>}><ClassesContent /></Suspense></main>; }
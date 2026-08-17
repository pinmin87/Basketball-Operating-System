'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, Plus, Users, Calendar, MapPin, X, UserPlus, Trash2, Clock, CheckCircle2, MinusCircle } from 'lucide-react';

const formatTime = (time24: string) => {
  if (!time24) return '';
  const [hourString, minute] = time24.split(':');
  const hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${ampm}`;
};

const DEFAULT_CLASS = { name: '', skillLevel: 'Foundation', venue: '', monthlyFee: '', schedules: [{ day: 'Saturday', startTime: '09:00', endTime: '11:00' }] };

function ClassesContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [globalPlayers, setGlobalPlayers] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const savedPlayers = localStorage.getItem('academy_players');
    if (savedPlayers) try { setGlobalPlayers(JSON.parse(savedPlayers)); } catch(e){}
    const savedClasses = localStorage.getItem('academy_classes');
    if (savedClasses) try { setClasses(JSON.parse(savedClasses)); } catch(e){}
    else setClasses([{ id: 'c1', name: 'U10 Foundation', skillLevel: 'Foundation', venue: 'Main Court', monthlyFee: 120, enrolledPlayers: [], schedules: [{ day: 'Saturday', startTime: '09:00', endTime: '11:00' }] }]);
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
    if (!classForm.name || !classForm.monthlyFee) return alert('Class Name and Fee required!');
    if (editingId) setClasses(classes.map(c => c.id === editingId ? { ...c, ...classForm } : c));
    else setClasses([{ id: `c${Date.now()}`, ...classForm, enrolledPlayers: [] }, ...classes]);
    setIsModalOpen(false);
  };

  const addSchedule = () => setClassForm({ ...classForm, schedules: [...classForm.schedules, { day: 'Sunday', startTime: '09:00', endTime: '11:00' }] });
  const removeSchedule = (idx: number) => setClassForm({ ...classForm, schedules: classForm.schedules.filter((_:any, i:number) => i !== idx) });
  const updateSchedule = (idx: number, field: string, value: string) => {
    const newSchedules = [...classForm.schedules];
    newSchedules[idx][field] = value;
    setClassForm({ ...classForm, schedules: newSchedules });
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

  if (!isMounted) return <div className="h-full flex items-center justify-center"><p className="text-gray-400 font-bold animate-pulse">Loading Classes...</p></div>;

  return (
    <div className="bg-gray-50 min-h-full pb-10">
      <header className="bg-blue-600 text-white p-4 pt-safe pb-6 rounded-b-[2.5rem] shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4 mt-2">
          <h1 className="text-2xl font-black">Classes</h1>
          <button onClick={() => { setEditingId(null); setClassForm(DEFAULT_CLASS); setIsModalOpen(true); }} className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-1 shadow-sm active:scale-95 transition-all"><Plus size={16} /><span>Add Class</span></button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-blue-200" />
          <input type="text" placeholder="Search classes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-blue-700/50 text-white placeholder-blue-200 rounded-2xl pl-11 pr-4 py-3.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-white border border-blue-500/30 backdrop-blur-sm" />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold bg-white rounded-3xl border border-gray-100 shadow-sm">No classes found.</div>
        ) : (
          filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 active:scale-[0.99] transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-gray-900 text-xl">{cls.name}</h3>
                  <span className="inline-flex text-[10px] font-black px-2.5 py-1 rounded-md mt-1.5 bg-blue-50 text-blue-600 uppercase tracking-wider">{cls.skillLevel}</span>
                </div>
                <div className="bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 text-center">
                  <span className="text-[9px] font-bold text-green-600 block uppercase tracking-wider">Fee/Mo</span>
                  <span className="font-black text-green-700 text-base">RM {cls.monthlyFee}</span>
                </div>
              </div>
              <div className="mb-5 bg-gray-50 p-4 rounded-2xl border border-gray-100/50 space-y-2">
                <div className="flex items-center text-sm text-gray-700 font-bold mb-2"><MapPin size={16} className="mr-2 text-blue-500" />{cls.venue || 'TBA'}</div>
                {cls.schedules?.map((sch: any, idx: number) => (
                  <div key={idx} className="flex items-center text-sm text-gray-700 font-bold bg-white p-2 rounded-lg border border-gray-100"><Calendar size={14} className="mr-2 text-blue-500" /> <span className="w-24">{sch.day}</span><Clock size={14} className="mr-2 ml-2 text-blue-500" /> {formatTime(sch.startTime)} - {formatTime(sch.endTime)}</div>
                ))}
              </div>
              <div className="flex space-x-3">
                <button onClick={() => openManagePlayers(cls)} className="flex-1 bg-blue-50 text-blue-700 font-black py-3.5 rounded-xl text-sm flex justify-center items-center active:bg-blue-100 transition-colors"><Users size={18} className="mr-2" />Manage Players ({cls.enrolledPlayers?.length || 0})</button>
                <button onClick={() => { setEditingId(cls.id); setClassForm(cls); setIsModalOpen(true); }} className="px-5 bg-gray-50 text-gray-600 font-bold rounded-xl text-sm active:bg-gray-100 border border-gray-200">Edit</button>
              </div>
            </div>
          ))
        )}
      </div>

      {isManagePlayersOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl flex flex-col h-[85vh] animate-in slide-in-from-bottom-5">
            <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-center bg-gray-50 rounded-t-[2.5rem]">
              <div><h3 className="font-black text-xl text-gray-900">{selectedClass.name}</h3><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Manage Enrolled Players</p></div>
              <button onClick={() => setIsManagePlayersOpen(false)} className="bg-white text-gray-400 rounded-full p-2.5 border border-gray-200 active:bg-gray-100"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white pb-32">
              <div className="mb-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Enrolled ({selectedClass.enrolledPlayers?.length || 0})</h4>
                <div className="space-y-3">
                  {(!selectedClass.enrolledPlayers || selectedClass.enrolledPlayers.length === 0) ? (
                    <div className="text-center py-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 text-sm font-bold">No players enrolled yet.</div>
                  ) : (
                    selectedClass.enrolledPlayers.map((ep: any) => (
                      <div key={ep.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center"><div className="bg-blue-100 p-2 rounded-full mr-3"><CheckCircle2 size={18} className="text-blue-600" /></div><div><p className="text-base font-bold text-gray-900">{ep.name}</p></div></div>
                        <button onClick={() => handleRemovePlayerFromClass(ep.id)} className="text-red-400 p-2.5 hover:bg-red-50 rounded-full transition-colors active:scale-95"><Trash2 size={20} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <hr className="border-gray-100 mb-6" />
              <div>
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-3 flex items-center"><UserPlus size={16} className="mr-1.5" /> Add from Database</h4>
                <div className="relative mb-4">
                  <Search size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input type="text" placeholder="Search by name or phone..." value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-[16px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-3">
                  {availablePlayers.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm font-bold">No available players found.</div>
                  ) : (
                    availablePlayers.map(player => (
                      <div key={player.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 active:border-blue-200 transition-colors">
                        <div><p className="text-base font-bold text-gray-900">{player.name}</p><p className="text-[11px] text-gray-500 font-bold mt-1">{player.parentPhone}</p></div>
                        <button onClick={() => handleAddPlayerToClass(player)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-black active:bg-blue-700 active:scale-95 shadow-sm">Add</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-end justify-center">
             <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl flex flex-col h-[90vh] animate-in slide-in-from-bottom-5">
                 <div className="p-6 border-b border-gray-100 shrink-0 flex justify-between items-center bg-gray-50 rounded-t-[2.5rem]">
                    <h3 className="font-black text-2xl text-gray-900">{editingId ? 'Edit Class' : 'Create Class'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="bg-white text-gray-400 rounded-full p-2.5 border border-gray-200 active:bg-gray-100"><X size={20} /></button>
                 </div>
                 
                 {/* 确保能滚动到底部 */}
                 <div className="p-6 overflow-y-auto flex-1 space-y-5 pb-32">
                    <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Class Name <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="e.g. U10 Foundation" value={classForm.name} onChange={e=>setClassForm({...classForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Skill Level</label>
                        <select value={classForm.skillLevel} onChange={e=>setClassForm({...classForm, skillLevel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                          <option value="Foundation">Foundation</option><option value="Development">Development</option><option value="Advanced">Advanced</option><option value="Elite">Elite</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fee (RM) <span className="text-red-500">*</span></label>
                        <input type="number" placeholder="e.g. 150" value={classForm.monthlyFee} onChange={e=>setClassForm({...classForm, monthlyFee: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Venue</label>
                      <input type="text" placeholder="e.g. Main Court A" value={classForm.venue} onChange={e=>setClassForm({...classForm, venue: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-[16px] focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 space-y-4">
                      <div className="flex justify-between items-center mb-1"><label className="block text-[11px] font-black text-blue-600 uppercase tracking-widest ml-1">Training Schedule</label></div>
                      
                      {classForm.schedules?.map((sch: any, index: number) => (
                        <div key={index} className="bg-white p-4 rounded-2xl border border-blue-200 relative">
                           {classForm.schedules.length > 1 && (<button onClick={() => removeSchedule(index)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1"><MinusCircle size={18} /></button>)}
                           <select value={sch.day} onChange={e=>updateSchedule(index, 'day', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-bold text-[16px] text-gray-800 mb-3 outline-none appearance-none">
                             <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option><option value="Friday">Friday</option><option value="Saturday">Saturday</option><option value="Sunday">Sunday</option>
                           </select>
                           <div className="grid grid-cols-2 gap-3">
                             <div><label className="block text-[10px] font-black text-blue-500 mb-1 ml-1 uppercase">Start</label><input type="time" value={sch.startTime} onChange={e=>updateSchedule(index, 'startTime', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 font-bold text-[16px] outline-none" /></div>
                             <div><label className="block text-[10px] font-black text-blue-500 mb-1 ml-1 uppercase">End</label><input type="time" value={sch.endTime} onChange={e=>updateSchedule(index, 'endTime', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 font-bold text-[16px] outline-none" /></div>
                           </div>
                        </div>
                      ))}
                      
                      {/* 这里就是您心心念念的 Add Another Session 按钮，保证绝对可见！ */}
                      <button onClick={addSchedule} className="w-full bg-blue-100 text-blue-700 font-black py-4 rounded-2xl text-sm flex items-center justify-center active:bg-blue-200 transition-colors">
                        <Plus size={18} className="mr-1.5" /> Add Another Session
                      </button>
                    </div>
                 </div>

                 <div className="p-6 pb-12 border-t border-gray-100 shrink-0 bg-white shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                     <button onClick={handleSaveClass} className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-2xl active:bg-blue-700 active:scale-95 transition-all shadow-md">Save Class</button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}

export default function ClassesPage() { return <Suspense fallback={<div>Loading...</div>}><ClassesContent /></Suspense>; }
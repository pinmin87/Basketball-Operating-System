'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Clock, CalendarDays, Wallet, X, MapPin, Trash2, Edit3, Search, CheckSquare, Phone, UserCog } from 'lucide-react';

const formatTime = (time24: string) => {
  if (!time24) return '';
  const [hourString, minute] = time24.split(':');
  const hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${ampm}`;
};

const MOCK_AVAILABLE_PLAYERS = [
  { id: 'p1', name: 'Ahmad bin Ali', phone: '012-3456789' },
  { id: 'p2', name: 'Jason Lee', phone: '011-2223334' },
  { id: 'p3', name: 'Ryan Tan', phone: '019-8887776' },
  { id: 'p4', name: 'Daniel Wong', phone: '016-5554443' },
  { id: 'p5', name: 'Adam Harris', phone: '017-9998887' },
];

const DEFAULT_CLASSES = [
  { 
    id: '1', name: 'Foundation Primary', skillLevel: 'Foundation', monthlyFee: 120, venue: 'Court 1', 
    schedules: [{ day: 'Friday', startTime: '16:00', endTime: '18:00' }],
    enrolledPlayers: [MOCK_AVAILABLE_PLAYERS[0], MOCK_AVAILABLE_PLAYERS[1]] 
  },
  { 
    id: '2', name: 'Elite Team U12', skillLevel: 'Competition', monthlyFee: 250, venue: 'Main Arena', 
    schedules: [{ day: 'Wednesday', startTime: '18:30', endTime: '20:00' }, { day: 'Saturday', startTime: '10:00', endTime: '12:00' }],
    enrolledPlayers: [] 
  },
];

const DEFAULT_NEW_CLASS = { name: '', skillLevel: 'Foundation', monthlyFee: '', venue: '', schedules: [{ day: 'Monday', startTime: '16:00', endTime: '18:00' }] };

export default function ClassesPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [classes, setClasses] = useState<any[]>(DEFAULT_CLASSES);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('academy_classes');
    if (saved) {
      try { setClasses(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('academy_classes', JSON.stringify(classes));
  }, [classes, isMounted]);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState<any>(DEFAULT_NEW_CLASS);

  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedClassForRoster, setSelectedClassForRoster] = useState<any>(null);

  // 状态变量也顺便改名，更符合语境
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedClassForManage, setSelectedClassForManage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const handleAddSchedule = () => setClassForm({ ...classForm, schedules: [...classForm.schedules, { day: 'Monday', startTime: '16:00', endTime: '18:00' }] });
  const handleRemoveSchedule = (index: number) => setClassForm({ ...classForm, schedules: classForm.schedules.filter((_: any, i: number) => i !== index) });
  const handleUpdateSchedule = (index: number, field: string, value: string) => setClassForm({ ...classForm, schedules: classForm.schedules.map((sch: any, i: number) => i === index ? { ...sch, [field]: value } : sch) });

  const openAddClass = () => { setEditingId(null); setClassForm(DEFAULT_NEW_CLASS); setIsClassModalOpen(true); };
  const openEditClass = (cls: any) => { setEditingId(cls.id); setClassForm({ ...cls, monthlyFee: cls.monthlyFee.toString() }); setIsClassModalOpen(true); };

  const handleSaveClass = () => {
    if (!classForm.name || !classForm.monthlyFee || classForm.schedules.length === 0) return alert('Name, Fee, and at least 1 schedule are required!');
    if (editingId) {
      setClasses(classes.map((c: any) => c.id === editingId ? { ...c, ...classForm, monthlyFee: Number(classForm.monthlyFee) } : c));
    } else {
      setClasses([{ id: Date.now().toString(), ...classForm, monthlyFee: Number(classForm.monthlyFee), enrolledPlayers: [] }, ...classes]);
    }
    setIsClassModalOpen(false);
  };

  const openRosterModal = (cls: any) => {
    setSelectedClassForRoster(cls);
    setIsRosterModalOpen(true);
  };

  const openManagePlayersModal = (cls: any) => {
    setSelectedClassForManage(cls);
    const existingIds = cls.enrolledPlayers ? cls.enrolledPlayers.map((p: any) => p.id) : [];
    setSelectedPlayerIds(existingIds);
    setSearchQuery('');
    setIsManageModalOpen(true);
  };

  const togglePlayerSelection = (id: string) => {
    setSelectedPlayerIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const handleConfirmPlayers = () => {
    const updatedEnrolledPlayers = MOCK_AVAILABLE_PLAYERS.filter(p => selectedPlayerIds.includes(p.id));
    setClasses(classes.map((c: any) => 
      c.id === selectedClassForManage.id ? { ...c, enrolledPlayers: updatedEnrolledPlayers } : c
    ));
    setIsManageModalOpen(false);
  };

  const filteredPlayers = MOCK_AVAILABLE_PLAYERS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery));

  const getSkillBadgeColor = (level: string) => {
    switch(level) {
      case 'Foundation': return 'bg-green-100 text-green-700'; case 'Development': return 'bg-blue-100 text-blue-700';
      case 'Advanced': return 'bg-purple-100 text-purple-700'; case 'Competition': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-32"><p className="text-gray-400 font-bold animate-pulse">Loading Classes...</p></div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-blue-600 text-white p-4 pt-safe pb-6 rounded-b-3xl shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold mb-1">Classes</h1>
          <p className="text-blue-100 text-xs">Manage schedules & players</p>
        </div>
        <button onClick={openAddClass} className="bg-white text-blue-600 font-bold px-3 py-2 rounded-xl text-sm flex items-center space-x-1 shadow-sm active:bg-blue-50 transition-colors">
          <Plus size={16} /><span>Setup Class</span>
        </button>
      </header>

      <div className="p-4 space-y-5 mt-2">
        {classes.map((cls: any, index: number) => (
          <div key={cls.id} className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-5 relative">
            <button onClick={() => openEditClass(cls)} className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 hover:text-blue-600 rounded-full active:bg-gray-100 transition-colors">
              <Edit3 size={18} />
            </button>

            <div className="flex justify-between items-start mb-4 pr-8">
              <div className="flex items-start space-x-2">
                <span className="bg-gray-100 text-gray-400 font-black text-sm px-2 py-1 rounded-lg mt-0.5">#{index + 1}</span>
                <div>
                  <h3 className="font-black text-xl text-gray-900 leading-tight">{cls.name}</h3>
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${getSkillBadgeColor(cls.skillLevel)}`}>
                    {cls.skillLevel}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-left mb-4 bg-green-50 p-3 rounded-xl inline-block border border-green-100">
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block mb-0.5">Monthly Fee</span>
                <span className="font-black text-xl text-green-700 tracking-tight">RM {cls.monthlyFee}</span>
            </div>
            
            <div className="space-y-2 mb-4">
              {cls.schedules.map((schedule: any, idx: number) => (
                <div key={idx} className="flex items-center text-sm font-medium text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100/50">
                  <CalendarDays size={16} className="text-blue-500 mr-2" />
                  <span className="w-24 text-gray-900">{schedule.day}</span>
                  <Clock size={16} className="text-blue-500 mr-2 ml-1" />
                  <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                </div>
              ))}
              
              {/* 场地显示 */}
              {cls.venue && (
                <div className="flex items-center text-sm text-gray-500 p-2 pl-3">
                  <MapPin size={16} className="mr-2 opacity-50" /> 
                  <span className="font-medium">{cls.venue}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button 
                onClick={() => openRosterModal(cls)}
                className="flex items-center text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors active:bg-gray-200"
              >
                <Users size={16} className="mr-1.5 text-gray-500" /> 
                {cls.enrolledPlayers?.length || 0} {(cls.enrolledPlayers?.length || 0) === 1 ? 'Student' : 'Students'}
              </button>
              
              <button 
                onClick={() => openManagePlayersModal(cls)} 
                className="flex items-center space-x-1 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl active:bg-blue-100 transition-colors"
              >
                {/* 文案已修复为 Manage Players */}
                <UserCog size={16} /><span>Manage Players</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- Modal 1: 查看班级名单 (View Students Modal) --- */}
      {isRosterModalOpen && selectedClassForRoster && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-xl text-gray-900">Class Students</h3>
                  <p className="text-sm font-bold text-blue-600 mt-1">{selectedClassForRoster.name}</p>
                </div>
                <button onClick={() => setIsRosterModalOpen(false)} className="text-gray-400 bg-gray-100 rounded-full p-2 font-bold active:bg-gray-200 transition-colors"><X size={18} /></button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto bg-gray-50 flex-1">
              {(!selectedClassForRoster.enrolledPlayers || selectedClassForRoster.enrolledPlayers.length === 0) ? (
                <div className="text-center py-10">
                  <Users size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 font-bold">No students enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedClassForRoster.enrolledPlayers.map((player: any) => (
                    <div key={player.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-50 p-2 rounded-full"><Users size={16} className="text-blue-600" /></div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{player.name}</p>
                          <div className="flex items-center text-[10px] font-bold text-gray-500 mt-0.5">
                            <Phone size={10} className="mr-1" /> {player.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Modal 2: 班级配置 (Setup Class Modal) --- */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <h3 className="font-black text-xl">{editingId ? 'Edit Class' : 'Create New Class'}</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-gray-400 bg-gray-100 rounded-full p-2 font-bold active:bg-gray-200 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Class Name</label>
                <input type="text" placeholder="e.g. SJK(C) Pei Hwa" value={classForm.name} onChange={(e) => setClassForm({...classForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Fee (RM)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Wallet size={16} className="text-gray-400" /></div>
                    <input type="number" placeholder="100" value={classForm.monthlyFee} onChange={(e) => setClassForm({...classForm, monthlyFee: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Skill Level</label>
                  <select value={classForm.skillLevel} onChange={(e) => setClassForm({...classForm, skillLevel: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Foundation">Foundation</option><option value="Development">Development</option><option value="Advanced">Advanced</option><option value="Competition">Competition</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Training Schedules</label>
                <div className="space-y-3">
                  {classForm.schedules.map((schedule: any, index: number) => (
                    <div key={index} className="flex flex-col space-y-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <div className="flex justify-between items-center">
                        <select value={schedule.day} onChange={(e) => handleUpdateSchedule(index, 'day', e.target.value)} className="w-1/2 bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (<option key={day} value={day}>{day}</option>))}
                        </select>
                        {classForm.schedules.length > 1 && (
                          <button onClick={() => handleRemoveSchedule(index)} className="p-2 text-red-500 bg-red-50 rounded-lg active:bg-red-100"><Trash2 size={16} /></button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1"><input type="time" value={schedule.startTime} onChange={(e) => handleUpdateSchedule(index, 'startTime', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" /></div>
                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-wider">TO</span>
                        <div className="flex-1"><input type="time" value={schedule.endTime} onChange={(e) => handleUpdateSchedule(index, 'endTime', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleAddSchedule} className="mt-3 text-sm font-bold text-blue-600 flex items-center space-x-1 active:text-blue-800"><Plus size={16} /><span>Add another session</span></button>
              </div>

              {/* 核心修复：找回丢失的 Venue/Court 场地输入框 */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Venue / Court</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input type="text" placeholder="e.g. SJK(C) Pei Hwa" value={classForm.venue} onChange={(e) => setClassForm({...classForm, venue: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

            </div>
            <div className="p-6 border-t border-gray-100 shrink-0">
              <button onClick={handleSaveClass} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl active:bg-blue-700 transition-colors shadow-md">{editingId ? 'Save Changes' : 'Create Class'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal 3: 管理班级名单弹窗 (Manage Players Modal) --- */}
      {isManageModalOpen && selectedClassForManage && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-xl text-gray-900">Manage Players</h3>
                <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 bg-gray-100 rounded-full p-2 font-bold active:bg-gray-200 transition-colors"><X size={18} /></button>
              </div>
              <p className="text-sm font-bold text-blue-600 bg-blue-50 p-3 rounded-xl">Class: {selectedClassForManage.name}</p>
              
              <div className="relative mt-4">
                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input type="text" placeholder="Search players..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-2 bg-gray-50 flex-1">
              {filteredPlayers.length === 0 ? (
                <p className="text-center text-gray-400 font-bold py-8">No players found</p>
              ) : (
                filteredPlayers.map(player => (
                  <label key={player.id} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${selectedPlayerIds.includes(player.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{player.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{player.phone}</p>
                    </div>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${selectedPlayerIds.includes(player.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                      {selectedPlayerIds.includes(player.id) && <CheckSquare size={16} />}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedPlayerIds.includes(player.id)} onChange={() => togglePlayerSelection(player.id)} />
                  </label>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-[2rem]">
              <button 
                onClick={handleConfirmPlayers}
                className="w-full font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center bg-blue-600 text-white active:bg-blue-700"
              >
                <span>Save Players ({selectedPlayerIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
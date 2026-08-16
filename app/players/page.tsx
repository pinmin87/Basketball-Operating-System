'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Plus, User, Phone, ShieldCheck, X, Edit3, Mail, MapPin, Wallet, CalendarDays, Clock, Activity, CheckCircle2, XCircle, History, CalendarRange } from 'lucide-react';

const formatTime = (time24: string) => {
  if (!time24) return '';
  const [hourString, minute] = time24.split(':');
  const hour = parseInt(hourString, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${minute} ${ampm}`;
};

const DEFAULT_PLAYER = { name: '', parentName: '', parentPhone: '', email: '', address: '', className: '' };

function PlayersContent() {
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  
  const [players, setPlayers] = useState<any[]>([]);
  const [academyClasses, setAcademyClasses] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const savedPlayers = localStorage.getItem('academy_players');
    if (savedPlayers) { try { setPlayers(JSON.parse(savedPlayers)); } catch (e) {} } 
    else {
      setPlayers([
        { id: 'p1', name: 'Ahmad bin Ali', parentName: 'Ali Bin Abu', parentPhone: '012-3456789', email: '', address: '', status: 'ACTIVE' },
        { id: 'p2', name: 'Jason Lee', parentName: 'Mr. Lee', parentPhone: '011-2223334', email: '', address: '', status: 'ACTIVE' },
      ]);
    }
    const savedClasses = localStorage.getItem('academy_classes');
    if (savedClasses) try { setAcademyClasses(JSON.parse(savedClasses)); } catch (e) {}
    const savedAtt = localStorage.getItem('academy_attendance');
    if (savedAtt) try { setAttendances(JSON.parse(savedAtt)); } catch (e) {}
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('academy_players', JSON.stringify(players));
  }, [players, isMounted]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [playerForm, setPlayerForm] = useState<any>(DEFAULT_PLAYER);
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'CLASSES' | 'ATTENDANCE'>('PROFILE');
  
  const [attTimeframe, setAttTimeframe] = useState<'TODAY' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('THIS_MONTH');
  const [attStartDate, setAttStartDate] = useState('');
  const [attEndDate, setAttEndDate] = useState('');

  const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.parentPhone.includes(searchQuery));

  const openAddModal = () => { setEditingId(null); setPlayerForm(DEFAULT_PLAYER); setActiveTab('PROFILE'); setIsModalOpen(true); };
  const openProfileModal = (player: any) => { setEditingId(player.id); setPlayerForm({ ...player }); setActiveTab('PROFILE'); setIsModalOpen(true); };

  const handleSavePlayer = () => {
    if (!playerForm.name || !playerForm.parentName || !playerForm.parentPhone) return alert('Required fields missing!');
    if (editingId) {
      setPlayers(players.map(p => p.id === editingId ? { ...p, ...playerForm } : p));
    } else {
      const newPlayer = { id: `p${Date.now()}`, ...playerForm, status: 'ACTIVE' };
      setPlayers([newPlayer, ...players]);
      if (playerForm.className) {
        const updatedClasses = academyClasses.map(cls => {
          if (cls.name === playerForm.className) return { ...cls, enrolledPlayers: [...(cls.enrolledPlayers || []), { id: newPlayer.id, name: newPlayer.name, phone: newPlayer.parentPhone }] };
          return cls;
        });
        setAcademyClasses(updatedClasses);
        localStorage.setItem('academy_classes', JSON.stringify(updatedClasses));
      }
    }
    setIsModalOpen(false);
  };

  const selectedClassDetails = academyClasses.find(c => c.name === playerForm.className);
  const playerEnrolledClasses = editingId ? academyClasses.filter(c => c.enrolledPlayers?.some((p: any) => p.id === editingId)) : [];
  const totalMonthlyFee = playerEnrolledClasses.reduce((sum, cls) => sum + (Number(cls.monthlyFee) || 0), 0);

  // Attendance Logic
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

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const thisMonthPrefix = todayStr.substring(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthPrefix = lastMonthDate.toISOString().split('T')[0].substring(0, 7);
  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(now.getDate() - 7);
  const lastWeekStr = sevenDaysAgoDate.toISOString().split('T')[0];

  const filteredRecords = playerRawRecords.filter(rec => {
    if (attTimeframe === 'TODAY') return rec.date === todayStr;
    if (attTimeframe === 'LAST_WEEK') return rec.date >= lastWeekStr && rec.date <= todayStr;
    if (attTimeframe === 'THIS_MONTH') return rec.date.startsWith(thisMonthPrefix);
    if (attTimeframe === 'LAST_MONTH') return rec.date.startsWith(lastMonthPrefix);
    if (attTimeframe === 'CUSTOM') {
      const passStart = attStartDate ? rec.date >= attStartDate : true;
      const passEnd = attEndDate ? rec.date <= attEndDate : true;
      return passStart && passEnd;
    }
    return true;
  });

  let attPresent = 0, attAbsent = 0, attLate = 0, attTotal = filteredRecords.length;
  filteredRecords.forEach(r => {
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

  if (!isMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-32"><p className="text-gray-400 font-bold animate-pulse">Loading Players...</p></div>;

  return (
    <div className="pb-32 bg-gray-50 min-h-screen">
      <header className="bg-blue-600 text-white p-4 pt-safe pb-6 rounded-b-3xl shadow-sm sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Players</h1>
          <button onClick={openAddModal} className="bg-white text-blue-600 font-bold px-3 py-2 rounded-xl text-sm flex items-center space-x-1 shadow-sm active:bg-blue-50 transition-colors"><Plus size={16} /><span>Add Student</span></button>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
          <input type="text" placeholder="Search student or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white text-gray-900 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm" />
        </div>
      </header>

      <div className="p-4 space-y-3">
        {filteredPlayers.map((player) => (
          <div 
            key={player.id} 
            onClick={() => openProfileModal(player)}
            className="bg-white p-4 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 relative cursor-pointer hover:border-blue-400 hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="absolute top-4 right-4 p-2 bg-gray-50 text-gray-400 rounded-full">
              <Edit3 size={16} />
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-50 p-3 rounded-full mt-1"><User size={20} className="text-blue-600" /></div>
              <div className="w-full">
                <p className="font-black text-gray-900 text-lg text-blue-700 hover:text-blue-800 transition-colors underline decoration-blue-200 underline-offset-4">{player.name}</p>
                <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 mt-1 bg-green-100 text-green-700">{player.status}</span>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs"><span className="text-gray-500 font-medium">Parent:</span><span className="font-bold text-gray-800">{player.parentName || 'N/A'}</span></div>
                  <div className="flex justify-between items-center text-xs"><span className="text-gray-500 font-medium">Phone:</span><span className="font-bold text-blue-600 flex items-center"><Phone size={10} className="mr-1" />{player.parentPhone}</span></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 pb-0 border-b border-gray-100 shrink-0">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-black text-xl">{editingId ? playerForm.name : 'Add New Player'}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 bg-gray-100 rounded-full p-2 font-bold active:bg-gray-200"><X size={18} /></button>
              </div>

              {editingId && (
                <div className="flex space-x-4">
                  <button onClick={() => setActiveTab('PROFILE')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'PROFILE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Profile</button>
                  <button onClick={() => setActiveTab('CLASSES')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'CLASSES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Classes</button>
                  <button onClick={() => setActiveTab('ATTENDANCE')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ATTENDANCE' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Attendance</button>
                </div>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-gray-50/50 rounded-b-[2rem]">
              {/* Tab Content remains consistent with previous logic */}
              {activeTab === 'PROFILE' && ( /* ... */ <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Student Name <span className="text-red-500">*</span></label><input type="text" value={playerForm.name} onChange={(e) => setPlayerForm({...playerForm, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Parent Name <span className="text-red-500">*</span></label><input type="text" value={playerForm.parentName} onChange={(e) => setPlayerForm({...playerForm, parentName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">Parent Phone <span className="text-red-500">*</span></label><input type="tel" value={playerForm.parentPhone} onChange={(e) => setPlayerForm({...playerForm, parentPhone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    </div>
                  </div>
                </div>)}
              {activeTab === 'CLASSES' && ( /* ... */ <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md">
                    <p className="text-green-100 text-xs font-bold uppercase tracking-wider mb-1">Total Monthly Fee</p>
                    <div className="flex items-center space-x-2"><Wallet size={24} className="text-green-200" /><span className="text-4xl font-black">RM {totalMonthlyFee}</span></div>
                  </div>
                  {playerEnrolledClasses.map((cls: any) => (<div key={cls.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"><h4 className="font-bold">{cls.name}</h4><span className="font-black text-green-600">RM {cls.monthlyFee}</span></div>))}
                </div>)}
              {activeTab === 'ATTENDANCE' && ( /* ... */ <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Attendance logic ... */}
              </div>)}
            </div>
            
            {activeTab === 'PROFILE' && (
              <div className="p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-[2rem]">
                <button onClick={handleSavePlayer} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center space-x-2 active:bg-blue-700 transition-colors shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
                  <ShieldCheck size={20} /><span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlayersPage() { return <main className="min-h-screen bg-gray-50"><Suspense fallback={<div className="p-4 flex justify-center text-gray-400 font-bold">Loading...</div>}><PlayersContent /></Suspense></main>; }
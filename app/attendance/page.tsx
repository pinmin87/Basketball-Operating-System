'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, CalendarDays, Users, CheckSquare, X, Download, CalendarRange, History, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase 初始化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | null;

export default function AttendancePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [academyId, setAcademyId] = useState<string | null>(null);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'DAILY' | 'OVERVIEW'>('DAILY');
  
  const [overviewTimeframe, setOverviewTimeframe] = useState<'TODAY' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedPlayerForHistory, setSelectedPlayerForHistory] = useState<any>(null);

  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoster, setCurrentRoster] = useState<{ playerId: string, name: string, status: AttendanceStatus }[]>([]);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchAcademyData();
  }, []);

  const fetchAcademyData = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase.from('profiles').select('academy_id').eq('id', session.user.id).single();
      const currentAcademyId = profile?.academy_id;

      if (currentAcademyId) {
        setAcademyId(currentAcademyId);

        const { data: classesData } = await supabase.from('classes').select('*').eq('academy_id', currentAcademyId);
        const { data: playersData } = await supabase.from('players').select('*').eq('academy_id', currentAcademyId).eq('status', 'ACTIVE');
        setPlayers(playersData || []);

        const { data: enrollmentData } = await supabase.from('player_class').select('*').eq('status', 'ACTIVE');
        
        const classesWithPlayers = (classesData || []).map(cls => {
          const enrolledPlayerIds = enrollmentData?.filter(e => e.class_id === cls.id).map(e => e.player_id) || [];
          const enrolledPlayers = playersData?.filter(p => enrolledPlayerIds.includes(p.id)) || [];
          return { ...cls, enrolledPlayers };
        });
        setClasses(classesWithPlayers);

        const { data: attendanceData } = await supabase.from('attendance').select('*').eq('academy_id', currentAcademyId);
        
        const formattedAttendances: any[] = [];
        if (attendanceData) {
          const grouped = attendanceData.reduce((acc: any, curr) => {
            const key = `${curr.class_id}_${curr.date}`;
            if (!acc[key]) acc[key] = { id: key, classId: curr.class_id, date: curr.date, records: [] };
            acc[key].records.push({ playerId: curr.player_id, status: curr.status });
            return acc;
          }, {});
          Object.values(grouped).forEach(g => formattedAttendances.push(g));
        }
        setAttendances(formattedAttendances);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const dateString = currentDate.toISOString().split('T')[0];
  const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
  const isToday = new Date().toISOString().split('T')[0] === dateString;

  const changeDate = (days: number) => { 
    const newDate = new Date(currentDate); 
    newDate.setDate(newDate.getDate() + days); 
    setCurrentDate(newDate); 
  };

  const classesToday = classes.filter(cls => {
    if (cls.schedules && cls.schedules.length > 0) {
      return cls.schedules.some((sch: any) => sch.dayOfWeek === dayOfWeek);
    }
    return cls.day_of_week === dayOfWeek || cls.day_of_week_2 === dayOfWeek;
  });

  const getAttendanceRecord = (classId: string, date: string) => attendances.find(a => a.classId === classId && a.date === date);

  const openAttendanceModal = (cls: any) => {
    setSelectedClass(cls);
    const existingRecord = getAttendanceRecord(cls.id, dateString);
    if (existingRecord) {
      setCurrentRoster(cls.enrolledPlayers?.map((p: any) => {
        const record = existingRecord.records.find((r: any) => r.playerId === p.id);
        return { playerId: p.id, name: p.name, status: record ? record.status : null };
      }) || []);
    } else {
      setCurrentRoster(cls.enrolledPlayers?.map((p: any) => ({ playerId: p.id, name: p.name, status: null })) || []);
    }
    setIsModalOpen(true);
  };

  const handleMarkAllPresent = () => setCurrentRoster(currentRoster.map(r => ({ ...r, status: 'PRESENT' })));
  const updatePlayerStatus = (playerId: string, status: AttendanceStatus) => setCurrentRoster(currentRoster.map(r => r.playerId === playerId ? { ...r, status } : r));

  const handleSaveAttendance = async () => {
    const unMarked = currentRoster.filter(r => r.status === null);
    if (unMarked.length > 0 && !confirm(`${unMarked.length} students haven't been marked. Do you still want to save?`)) return;
    
    if (!academyId || !selectedClass) return;
    setIsSavingAttendance(true);

    try {
      // 删除当天旧记录，防止重复
      await supabase.from('attendance')
        .delete()
        .eq('class_id', selectedClass.id)
        .eq('date', dateString);

      // 准备批量插入数据
      const payload = currentRoster
        .filter(r => r.status !== null)
        .map(r => ({
          academy_id: academyId,
          class_id: selectedClass.id,
          player_id: r.playerId,
          date: dateString,
          status: r.status
        }));

      if (payload.length > 0) {
        const { error } = await supabase.from('attendance').insert(payload);
        if (error) throw error;
      }

      // 成功后，更新本地 UI 状态
      const newRecord = { 
        id: `${selectedClass.id}_${dateString}`, 
        classId: selectedClass.id, 
        date: dateString, 
        records: currentRoster.filter(r => r.status !== null).map(r => ({ playerId: r.playerId, status: r.status })) 
      };
      setAttendances([...attendances.filter(a => a.id !== newRecord.id), newRecord]);
      setIsModalOpen(false);
      alert('Attendance saved successfully!');

    } catch (error: any) {
      console.error('Error saving attendance:', error);
      alert(`Failed to save attendance: ${error.message}`);
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthPrefix = lastMonthDate.toISOString().split('T')[0].substring(0, 7);
  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(now.getDate() - 7);
  const lastWeekStr = sevenDaysAgoDate.toISOString().split('T')[0];

  const filteredAttendances = attendances.filter(att => {
    if (overviewTimeframe === 'TODAY') return att.date === todayStr;
    if (overviewTimeframe === 'LAST_WEEK') return att.date >= lastWeekStr && att.date <= todayStr;
    if (overviewTimeframe === 'THIS_MONTH') return att.date.startsWith(currentMonthPrefix);
    if (overviewTimeframe === 'LAST_MONTH') return att.date.startsWith(lastMonthPrefix);
    if (overviewTimeframe === 'CUSTOM') {
      const passStart = customStart ? att.date >= customStart : true;
      const passEnd = customEnd ? att.date <= customEnd : true;
      return passStart && passEnd;
    }
    return true;
  });

  const playerStats = players.map(player => {
    let present = 0, absent = 0, late = 0, total = 0;
    filteredAttendances.forEach(record => {
      const pRecord = record.records.find((r: any) => r.playerId === player.id);
      if (pRecord) {
        total++;
        if (pRecord.status === 'PRESENT') present++;
        if (pRecord.status === 'ABSENT') absent++;
        if (pRecord.status === 'LATE') late++;
      }
    });
    const rate = total === 0 ? 0 : Math.round((present / total) * 100);
    return { ...player, present, absent, late, total, rate };
  });

  const getReportPeriodName = () => {
    if (overviewTimeframe === 'TODAY') return `Today (${todayStr})`;
    if (overviewTimeframe === 'LAST_WEEK') return `Last 7 Days (${lastWeekStr} to ${todayStr})`;
    if (overviewTimeframe === 'THIS_MONTH') return `This Month (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
    if (overviewTimeframe === 'LAST_MONTH') return `Last Month (${lastMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
    if (overviewTimeframe === 'CUSTOM') return `Custom Period: ${customStart || 'Start'} to ${customEnd || 'End'}`;
    return 'All Time Record';
  };

  const openPlayerHistory = (playerStat: any) => {
    setSelectedPlayerForHistory(playerStat);
    setIsHistoryModalOpen(true);
  };

  let playerHistoryRecords: any[] = [];
  if (selectedPlayerForHistory) {
    filteredAttendances.forEach(att => {
      const pRecord = att.records.find((r: any) => r.playerId === selectedPlayerForHistory.id);
      if (pRecord) {
        const cls = classes.find(c => c.id === att.classId);
        playerHistoryRecords.push({
          date: att.date,
          className: cls?.name || 'Unknown Class',
          status: pRecord.status
        });
      }
    });
    playerHistoryRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  const getStatusStyle = (status: string) => {
    if (status === 'PRESENT') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'ABSENT') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'LATE') return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getScheduleTime = (cls: any, day: string) => {
    if (cls.schedules && cls.schedules.length > 0) {
      const sch = cls.schedules.find((s:any) => s.dayOfWeek === day);
      if (sch) return `${sch.startTime} - ${sch.endTime}`;
    }
    if (cls.day_of_week === day) return `${cls.start_time?.substring(0,5)} - ${cls.end_time?.substring(0,5)}`;
    if (cls.day_of_week_2 === day) return `${cls.start_time_2?.substring(0,5)} - ${cls.end_time_2?.substring(0,5)}`;
    return 'Time not set';
  };

  if (!isMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-32"><p className="text-gray-400 font-bold animate-pulse">Loading...</p></div>;

  return (
    <main className="min-h-screen bg-gray-50 pb-32 print:bg-white print:pb-0 print:p-8">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 20mm; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; -webkit-print-color-adjust: exact; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 14px; }
          th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 12px; }
          .rate-badge { padding: 4px 8px; border-radius: 6px; font-weight: bold; }
          .rate-good { background-color: #dcfce7; color: #15803d; }
          .rate-bad { background-color: #fee2e2; color: #b91c1c; }
          .rate-neutral { background-color: #f1f5f9; color: #64748b; }
          .print-no-link { color: inherit !important; text-decoration: none !important; }
        }
      `}} />

      <header className="bg-blue-600 text-white p-4 pt-safe pb-6 rounded-b-3xl shadow-sm sticky top-0 z-10 no-print">
        <h1 className="text-xl font-bold mb-4 text-center">Attendance</h1>
        <div className="flex bg-white/20 p-1 rounded-xl mb-4">
          <button onClick={() => setActiveView('DAILY')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeView === 'DAILY' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100'}`}>Daily Check-in</button>
          <button onClick={() => setActiveView('OVERVIEW')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeView === 'OVERVIEW' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-100'}`}>Analytics Overview</button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 no-print">
          <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
          <p className="text-sm font-bold text-gray-500">Syncing database...</p>
        </div>
      ) : activeView === 'DAILY' ? (
        <div className="p-4 mt-2 space-y-4 no-print animate-in fade-in">
          <div className="flex items-center justify-between bg-white rounded-2xl p-2 border border-gray-200 shadow-sm mb-6">
            <button onClick={() => changeDate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft size={24} /></button>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{dayOfWeek}</p>
              <p className="text-lg font-black text-blue-600">{isToday ? 'Today' : currentDate.toLocaleDateString('en-GB')}</p>
            </div>
            <button onClick={() => changeDate(1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"><ChevronRight size={24} /></button>
          </div>

          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Classes on this day</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">{classesToday.length} Total</span>
          </div>

          {classesToday.length === 0 ? (
            <div className="text-center bg-white rounded-3xl p-10 border border-gray-100 shadow-sm mt-4">
              <CalendarDays size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-500 font-bold text-lg">No classes scheduled</p>
            </div>
          ) : (
            classesToday.map(cls => {
              const record = getAttendanceRecord(cls.id, dateString);
              const isCompleted = !!record;
              const presentCount = record ? record.records.filter((r:any) => r.status === 'PRESENT').length : 0;
              const totalEnrolled = cls.enrolledPlayers?.length || 0;

              return (
                <div key={cls.id} onClick={() => openAttendanceModal(cls)} className={`bg-white p-5 rounded-3xl shadow-sm cursor-pointer transition-all active:scale-[0.98] ${isCompleted ? 'border-2 border-green-500' : 'border border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-black text-xl text-gray-900 leading-tight">{cls.name}</h3>
                      <p className="text-xs text-gray-500 font-bold mt-1">{getScheduleTime(cls, dayOfWeek)}</p>
                    </div>
                    {isCompleted ? (
                      <div className="flex flex-col items-end">
                        <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider mb-1 flex items-center"><CheckCircle2 size={12} className="mr-1" /> Completed</span>
                        <span className="text-sm font-black text-gray-700">{presentCount} / {totalEnrolled} Present</span>
                      </div>
                    ) : (
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center">Pending</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : null}

      {activeView === 'OVERVIEW' && !isLoading && (
        <div className="p-4 mt-2 animate-in fade-in">
          
          <div className="flex justify-between items-center mb-6 no-print">
            <h2 className="text-lg font-black text-gray-900">Overall Analytics</h2>
            <button onClick={() => window.print()} className="flex items-center space-x-1 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl active:bg-blue-100 transition-colors border border-blue-100 shadow-sm">
              <Download size={16} /><span>Export PDF</span>
            </button>
          </div>

          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center mb-4 no-print">
            <CalendarRange size={18} className="text-blue-500 ml-2 mr-3" />
            <select 
              value={overviewTimeframe} 
              onChange={(e) => setOverviewTimeframe(e.target.value as any)}
              className="w-full bg-transparent font-bold text-gray-800 focus:outline-none py-2"
            >
              <option value="TODAY">Today</option>
              <option value="LAST_WEEK">Last 7 Days (Last Week)</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="CUSTOM">Custom Date Range...</option>
            </select>
          </div>

          {overviewTimeframe === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 mb-6 no-print animate-in slide-in-from-top-2">
              <div>
                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">From</label>
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">To</label>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          )}

          <div className="hidden print-only mb-6">
            <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '24px' }}>
              <h1 className="text-3xl font-black text-gray-900" style={{ color: '#1e3a8a' }}>Academy Attendance Report</h1>
              <div className="flex justify-between mt-2 text-gray-500">
                <p className="font-bold">Period: {getReportPeriodName()}</p>
                <p>Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Player Name</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Sessions</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center text-green-600">P</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center text-red-600">A</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center text-orange-600">L</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {playerStats.map((stat, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => openPlayerHistory(stat)}
                      className="hover:bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-bold text-blue-600 text-sm whitespace-nowrap print-no-link flex items-center">
                        {stat.name}
                      </td>
                      <td className="p-4 text-center font-bold text-gray-500 text-sm">{stat.total}</td>
                      <td className="p-4 text-center font-bold text-green-600 text-sm">{stat.present}</td>
                      <td className="p-4 text-center font-bold text-red-600 text-sm">{stat.absent}</td>
                      <td className="p-4 text-center font-bold text-orange-600 text-sm">{stat.late}</td>
                      <td className="p-4 text-right font-black text-sm whitespace-nowrap">
                        <span className={`rate-badge ${stat.rate >= 80 ? 'rate-good bg-green-100 text-green-700' : stat.total > 0 && stat.rate < 50 ? 'rate-bad bg-red-100 text-red-700' : 'rate-neutral bg-gray-100 text-gray-500'}`}>
                          {stat.total > 0 ? `${stat.rate}%` : '--'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {playerStats.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400 font-bold">No players found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal 1: 每日点名弹窗 --- */}
      {isModalOpen && selectedClass && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-white rounded-t-[2rem] z-10">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-black text-xl leading-tight">{selectedClass.name}</h3>
                  <p className="text-xs font-bold text-gray-400 mt-1">{isToday ? 'Today' : currentDate.toLocaleDateString('en-GB')}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 bg-gray-100 rounded-full p-2 font-bold active:bg-gray-200 transition-colors"><X size={18} /></button>
              </div>
              <button onClick={handleMarkAllPresent} className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 font-black py-3 rounded-xl active:bg-blue-100 transition-colors border border-blue-200 shadow-sm">
                <CheckSquare size={20} /><span>Mark All Present</span>
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto bg-gray-50 flex-1 space-y-3">
              {currentRoster.length === 0 ? (
                <div className="text-center py-10"><Users size={40} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500 font-bold">No active students found in this class.</p></div>
              ) : (
                currentRoster.map((player) => (
                  <div key={player.playerId} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <p className="font-bold text-gray-900 mb-3 text-lg">{player.name}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => updatePlayerStatus(player.playerId, 'PRESENT')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${player.status === 'PRESENT' ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'border-gray-100 text-gray-400 active:bg-gray-50'}`}>
                        <CheckCircle2 size={24} className="mb-1" /><span className="text-[10px] font-black">Present</span>
                      </button>
                      <button onClick={() => updatePlayerStatus(player.playerId, 'ABSENT')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${player.status === 'ABSENT' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'border-gray-100 text-gray-400 active:bg-gray-50'}`}>
                        <XCircle size={24} className="mb-1" /><span className="text-[10px] font-black">Absent</span>
                      </button>
                      <button onClick={() => updatePlayerStatus(player.playerId, 'LATE')} className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${player.status === 'LATE' ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-sm' : 'border-gray-100 text-gray-400 active:bg-gray-50'}`}>
                        <Clock size={24} className="mb-1" /><span className="text-[10px] font-black">Late</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0 bg-white rounded-b-[2rem]">
              <button onClick={handleSaveAttendance} disabled={isSavingAttendance} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center space-x-2 active:bg-blue-700 transition-colors shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed">
                {isSavingAttendance ? <Loader2 size={24} className="animate-spin" /> : <span>Save Attendance</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal 2: 个人历史流水 --- */}
      {isHistoryModalOpen && selectedPlayerForHistory && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print z-[60]">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            
            <div className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-white rounded-t-[2rem] z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-2xl leading-tight text-gray-900">{selectedPlayerForHistory.name}</h3>
                  <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-md mt-2">
                    {getReportPeriodName()}
                  </p>
                </div>
                <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 bg-gray-100 rounded-full p-2 font-bold active:bg-gray-200 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className="bg-gray-50 p-2 rounded-xl text-center">
                  <p className="text-sm font-black">{selectedPlayerForHistory.total}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Total</p>
                </div>
                <div className="bg-green-50 p-2 rounded-xl text-center">
                  <p className="text-sm font-black text-green-700">{selectedPlayerForHistory.present}</p>
                  <p className="text-[9px] font-bold text-green-600 uppercase">Present</p>
                </div>
                <div className="bg-red-50 p-2 rounded-xl text-center">
                  <p className="text-sm font-black text-red-700">{selectedPlayerForHistory.absent}</p>
                  <p className="text-[9px] font-bold text-red-600 uppercase">Absent</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-xl text-center border border-blue-100 shadow-sm">
                  <p className="text-sm font-black text-blue-700">{selectedPlayerForHistory.rate}%</p>
                  <p className="text-[9px] font-bold text-blue-600 uppercase">Rate</p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <h4 className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                <History size={14} className="mr-1.5" /> Session History Details
              </h4>
              
              <div className="space-y-3">
                {playerHistoryRecords.length === 0 ? (
                  <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <History size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-400 text-sm font-bold">No sessions found in this period.</p>
                  </div>
                ) : (
                  playerHistoryRecords.map((record: any, idx: number) => (
                    <div key={idx} className={`flex justify-between items-center p-4 rounded-2xl border shadow-sm bg-white ${getStatusStyle(record.status)}`}>
                      <div>
                        <p className="text-sm font-black text-gray-900">{record.date}</p>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mt-1">{record.className}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                        record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {record.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </main>
  );
}
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, CheckCircle2, AlertCircle, UploadCloud, Calendar, X, CalendarRange, Download, ShieldCheck, Filter } from 'lucide-react';

function FeesContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  const [timeframe, setTimeframe] = useState<'TODAY' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('THIS_MONTH');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  const [activeTab, setActiveTab] = useState<'UNPAID' | 'PAID' | 'ALL'>('UNPAID');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [receiptRef, setReceiptRef] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const savedClasses = localStorage.getItem('academy_classes');
    if (savedClasses) { try { setClasses(JSON.parse(savedClasses)); } catch (e) {} }

    const savedFees = localStorage.getItem('academy_fees');
    if (savedFees) {
      try { setFeeRecords(JSON.parse(savedFees)); } catch (e) {}
    } else {
      const initialRecords = [
        { id: 'f1', playerId: 'p1', playerName: 'Ahmad bin Ali', className: 'Foundation Primary', monthlyFee: 120, amountPaid: 120, paymentDate: '2026-08-15', paymentMethod: 'Touch n Go', reference: 'TNG-112', status: 'PAID' },
        { id: 'f2', playerId: 'p2', playerName: 'Jason Lee', className: 'Development Primary', monthlyFee: 160, amountPaid: 0, paymentDate: '', paymentMethod: 'Bank Transfer', reference: '', status: 'UNPAID' },
      ];
      setFeeRecords(initialRecords);
      localStorage.setItem('academy_fees', JSON.stringify(initialRecords));
    }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('academy_fees', JSON.stringify(feeRecords));
  }, [feeRecords, isMounted]);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthPrefix = lastMonthDate.toISOString().split('T')[0].substring(0, 7);
  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(now.getDate() - 7);
  const lastWeekStr = sevenDaysAgoDate.toISOString().split('T')[0];

  const filteredByTimeAndClass = feeRecords.filter(record => {
    const targetDate = record.paymentDate || todayStr;
    let matchTime = true;
    if (timeframe === 'TODAY') matchTime = (targetDate === todayStr);
    else if (timeframe === 'LAST_WEEK') matchTime = (targetDate >= lastWeekStr && targetDate <= todayStr);
    else if (timeframe === 'THIS_MONTH') matchTime = (targetDate.startsWith(currentMonthPrefix));
    else if (timeframe === 'LAST_MONTH') matchTime = (targetDate.startsWith(lastMonthPrefix));
    else if (timeframe === 'CUSTOM') {
      const passStart = customStart ? targetDate >= customStart : true;
      const passEnd = customEnd ? targetDate <= customEnd : true;
      matchTime = passStart && passEnd;
    }
    const matchClass = (selectedClassFilter === 'ALL' || record.className === selectedClassFilter);
    return matchTime && matchClass;
  });

  const totalExpected = filteredByTimeAndClass.reduce((sum, record) => sum + record.monthlyFee, 0);
  const totalCollected = filteredByTimeAndClass.reduce((sum, record) => sum + record.amountPaid, 0);
  const totalOutstanding = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  const finalFilteredRecords = filteredByTimeAndClass.filter(record => {
    if (activeTab === 'UNPAID') return record.status === 'UNPAID' || record.status === 'PARTIAL';
    if (activeTab === 'PAID') return record.status === 'PAID';
    return true;
  });

  const openPaymentModal = (record: any) => {
    setSelectedRecord(record);
    const balance = record.monthlyFee - record.amountPaid;
    setPaymentAmount(balance > 0 ? balance.toString() : record.monthlyFee.toString()); 
    setPaymentDate(record.paymentDate || new Date().toISOString().split('T')[0]); 
    setPaymentMethod(record.paymentMethod || 'Bank Transfer');
    setReceiptRef(record.reference || '');
    setIsModalOpen(true);
  };

  const handleSavePayment = () => {
    const amountEntered = Number(paymentAmount);
    if (amountEntered < 0) return alert('Please enter a valid amount.');

    setFeeRecords(feeRecords.map(record => {
      if (record.id === selectedRecord.id) {
        const cappedPaid = amountEntered > record.monthlyFee ? record.monthlyFee : amountEntered;
        let newStatus = 'UNPAID';
        if (cappedPaid >= record.monthlyFee) newStatus = 'PAID';
        else if (cappedPaid > 0) newStatus = 'PARTIAL';

        return { 
          ...record, amountPaid: cappedPaid, paymentDate: paymentDate, paymentMethod: paymentMethod, reference: receiptRef, status: newStatus 
        };
      }
      return record;
    }));
    setIsModalOpen(false);
  };

  if (!isMounted) return <div className="h-full flex items-center justify-center"><p className="text-gray-400 font-bold animate-pulse">Loading Fees...</p></div>;

  return (
    <div className="bg-gray-50 min-h-full pb-10 print:bg-white print:pb-0 print:p-8">
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: A4; margin: 20mm; } .no-print { display: none !important; } .print-only { display: block !important; } body { background: white; -webkit-print-color-adjust: exact; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 14px; } th { background-color: #f8fafc; font-weight: bold; color: #475569; text-transform: uppercase; font-size: 12px; } }`}} />

      <header className="bg-blue-600 text-white pt-safe rounded-b-[2.5rem] shadow-md relative overflow-hidden no-print">
        <div className="absolute inset-0 bg-blue-700/20 pointer-events-none"></div>
        <div className="p-6 relative z-10 pt-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black">Fees Collection</h1>
            <button onClick={() => window.print()} className="flex items-center space-x-1 text-xs font-bold bg-white text-blue-600 px-3 py-2 rounded-xl shadow-sm active:scale-95"><Download size={14} /><span>Export PDF</span></button>
          </div>

          <div className="bg-blue-700/40 p-5 rounded-[1.5rem] border border-blue-500/50 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-3">
              <div><p className="text-[11px] font-black uppercase tracking-widest text-blue-200 mb-1">Outstanding</p><p className="text-3xl font-black">RM {totalOutstanding}</p></div>
              <div className="text-right"><p className="text-[11px] font-black uppercase tracking-widest text-blue-200 mb-1">Collected</p><p className="text-xl font-bold text-green-300">RM {totalCollected}</p></div>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-2 mt-2 overflow-hidden flex"><div className="bg-green-400 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${collectionRate}%` }}></div></div>
          </div>
        </div>
      </header>

      <div className="px-4 mt-4 no-print space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center">
            <CalendarRange size={18} className="text-blue-500 ml-3 mr-3 shrink-0" />
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value as any)} className="w-full bg-transparent font-bold text-[15px] text-gray-800 focus:outline-none py-2 outline-none appearance-none">
              <option value="TODAY">Today</option><option value="LAST_WEEK">Last 7 Days</option><option value="THIS_MONTH">This Month</option><option value="LAST_MONTH">Last Month</option><option value="CUSTOM">Custom Date...</option>
            </select>
          </div>
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center">
            <Filter size={18} className="text-blue-500 ml-3 mr-3 shrink-0" />
            <select value={selectedClassFilter} onChange={(e) => setSelectedClassFilter(e.target.value)} className="w-full bg-transparent font-bold text-[15px] text-gray-800 focus:outline-none py-2 outline-none appearance-none">
              <option value="ALL">All Classes</option>
              {classes.map((cls: any) => (<option key={cls.id} value={cls.name}>{cls.name}</option>))}
            </select>
          </div>
        </div>

        {timeframe === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
            <div><label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">From</label><input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[15px] font-bold focus:outline-none" /></div>
            <div><label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">To</label><input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[15px] font-bold focus:outline-none" /></div>
          </div>
        )}

        {/* 核心修复：完全写死了样式代码，再也不会出现 activeViewStyle 报错！ */}
        <div className="flex bg-gray-200/60 p-1.5 rounded-2xl">
          <button onClick={() => setActiveTab('UNPAID')} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'UNPAID' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>UNPAID</button>
          <button onClick={() => setActiveTab('PAID')} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'PAID' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>PAID</button>
          <button onClick={() => setActiveTab('ALL')} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'ALL' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>ALL</button>
        </div>
      </div>

      <div className="hidden print-only mb-6"><div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '24px' }}><h1 className="text-3xl font-black text-gray-900" style={{ color: '#1e3a8a' }}>Academy Fee Report</h1></div></div>

      <div className="p-4 space-y-4 no-print pb-24">
        {finalFilteredRecords.map((record) => {
          const balance = record.monthlyFee - record.amountPaid;
          const isPaid = record.status === 'PAID';
          return (
            <div key={record.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col active:scale-[0.99] transition-transform">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-black text-gray-900 text-lg">{record.playerName}</p>
                  <p className="text-xs font-bold text-gray-500 mb-3 mt-0.5">{record.className} • Due: RM {record.monthlyFee}</p>
                  {isPaid ? (
                    <span className="inline-flex items-center text-[10px] font-black px-2.5 py-1.5 rounded-md bg-green-50 text-green-600 border border-green-100"><CheckCircle2 size={14} className="mr-1.5" /> PAID: RM {record.amountPaid} ({record.paymentMethod})</span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-black px-2.5 py-1.5 rounded-md bg-red-50 text-red-600 border border-red-100"><AlertCircle size={14} className="mr-1.5" /> BALANCE DUE: RM {balance}</span>
                  )}
                </div>
                <div className="ml-4 shrink-0">
                  <button onClick={() => openPaymentModal(record)} className="text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-xl transition-colors border border-blue-100">{record.amountPaid > 0 ? 'Edit' : 'Record'}</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden print-only">
        <table>
          <thead><tr><th>Player Name</th><th>Class</th><th>Due</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>{finalFilteredRecords.map((r, i) => (<tr key={i}><td>{r.playerName}</td><td>{r.className}</td><td>RM {r.monthlyFee}</td><td>RM {r.amountPaid}</td><td>RM {r.monthlyFee - r.amountPaid}</td><td>{r.status}</td><td>{r.paymentDate || '-'}</td></tr>))}</tbody>
        </table>
      </div>

      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5">
            <div className="p-6 border-b border-gray-100 shrink-0 bg-white rounded-t-[2.5rem] flex justify-between items-center">
              <div><h3 className="font-black text-2xl text-gray-900">{selectedRecord.playerName}</h3><p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">{selectedRecord.className}</p></div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white text-gray-400 rounded-full p-2.5 border border-gray-200 active:bg-gray-100"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 pb-20">
              <div className="bg-blue-50 p-5 rounded-[1.5rem] border border-blue-100 shadow-sm">
                <label className="block text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Paid Amount (RM)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span className="font-black text-gray-400 text-lg">RM</span></div>
                  <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-4 text-2xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <p className="text-[11px] font-bold text-gray-400 mt-3 text-right">Fee Due: RM {selectedRecord.monthlyFee}</p>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Payment Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-4 text-gray-400" />
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-4 text-[16px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Payment Method</label>
                <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 font-bold text-[16px] text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Touch n Go">Touch 'n Go eWallet</option>
                  <option value="DuitNow">DuitNow QR</option>
                  <option value="Card">Credit/Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Receipt / Reference No.</label>
                <div className="flex space-x-2">
                  <input type="text" placeholder="e.g. REF-123456" value={receiptRef} onChange={(e) => setReceiptRef(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-[16px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 rounded-2xl flex items-center justify-center transition-colors border border-gray-200 shadow-sm" title="Upload Receipt">
                    <UploadCloud size={24} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 pb-12 border-t border-gray-100 shrink-0 bg-white">
              <button type="button" onClick={handleSavePayment} className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-2xl active:bg-blue-700 active:scale-95 transition-all shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)]">
                Save Payment Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeesPage() { return <Suspense fallback={<div>Loading...</div>}><FeesContent /></Suspense>; }
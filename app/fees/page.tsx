'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, UploadCloud, Calendar, CreditCard, Banknote, Edit3, Receipt, X, CalendarRange, Download, ShieldCheck, Filter } from 'lucide-react';

export default function FeesPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  
  // 核心升级：时间切片与班级筛选状态
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
    // 1. 读取班级列表用于下拉筛选
    const savedClasses = localStorage.getItem('academy_classes');
    if (savedClasses) { try { setClasses(JSON.parse(savedClasses)); } catch (e) {} }

    // 2. 读取或初始化学费账单数据
    const savedFees = localStorage.getItem('academy_fees');
    if (savedFees) {
      try { setFeeRecords(JSON.parse(savedFees)); } catch (e) {}
    } else {
      const initialRecords = [
        { id: 'f1', playerId: 'p1', playerName: 'Ahmad bin Ali', className: 'Foundation Primary', monthlyFee: 120, amountPaid: 120, paymentDate: '2026-08-15', paymentMethod: 'Cash', reference: '', status: 'PAID' },
        { id: 'f2', playerId: 'p2', playerName: 'Jason Lee', className: 'Development Primary', monthlyFee: 160, amountPaid: 0, paymentDate: '', paymentMethod: 'Bank Transfer', reference: '', status: 'UNPAID' },
        { id: 'f3', playerId: 'p3', playerName: 'Ryan Tan', className: 'Foundation Primary', monthlyFee: 120, amountPaid: 0, paymentDate: '', paymentMethod: 'Bank Transfer', reference: '', status: 'UNPAID' },
        { id: 'f4', playerId: 'p4', playerName: 'Daniel Wong', className: 'Development Primary', monthlyFee: 60, amountPaid: 0, paymentDate: '', paymentMethod: 'Touch n Go', reference: '', status: 'UNPAID' },
        { id: 'f5', playerId: 'p5', playerName: 'Adam Harris', className: 'Competition U12', monthlyFee: 300, amountPaid: 300, paymentDate: '2026-08-10', paymentMethod: 'Bank Transfer', reference: 'REF-889922', status: 'PAID' },
      ];
      setFeeRecords(initialRecords);
      localStorage.setItem('academy_fees', JSON.stringify(initialRecords));
    }
  }, []);

  useEffect(() => {
    if (isMounted) localStorage.setItem('academy_fees', JSON.stringify(feeRecords));
  }, [feeRecords, isMounted]);

  // ============================================================
  // 组合过滤算法 (时间切片 + 班级筛选)
  // ============================================================
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);
  
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthPrefix = lastMonthDate.toISOString().split('T')[0].substring(0, 7);

  const sevenDaysAgoDate = new Date();
  sevenDaysAgoDate.setDate(now.getDate() - 7);
  const lastWeekStr = sevenDaysAgoDate.toISOString().split('T')[0];

  const filteredByTimeAndClass = feeRecords.filter(record => {
    // 1. 时间过滤
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

    // 2. 班级过滤
    const matchClass = (selectedClassFilter === 'ALL' || record.className === selectedClassFilter);

    return matchTime && matchClass;
  });

  // 财务看板统计（基于双重过滤后的记录）
  const totalExpected = filteredByTimeAndClass.reduce((sum, record) => sum + record.monthlyFee, 0);
  const totalCollected = filteredByTimeAndClass.reduce((sum, record) => sum + record.amountPaid, 0);
  const totalOutstanding = totalExpected - totalCollected;
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  // 选项卡过滤 (UNPAID / PAID / ALL)
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
        const newBalance = record.monthlyFee - cappedPaid;
        
        let newStatus = 'UNPAID';
        if (cappedPaid >= record.monthlyFee) newStatus = 'PAID';
        else if (cappedPaid > 0) newStatus = 'PARTIAL';

        return { 
          ...record, 
          amountPaid: cappedPaid,
          paymentDate: paymentDate,
          paymentMethod: paymentMethod,
          reference: receiptRef,
          status: newStatus 
        };
      }
      return record;
    }));
    
    setIsModalOpen(false);
  };

  const getReportPeriodName = () => {
    let periodStr = 'All Time';
    if (timeframe === 'TODAY') periodStr = `Today (${todayStr})`;
    else if (timeframe === 'LAST_WEEK') periodStr = `Last 7 Days`;
    else if (timeframe === 'THIS_MONTH') periodStr = `This Month`;
    else if (timeframe === 'LAST_MONTH') periodStr = `Last Month`;
    else if (timeframe === 'CUSTOM') periodStr = `Custom (${customStart} to ${customEnd})`;
    
    return `${periodStr} | Class: ${selectedClassFilter}`;
  };

  if (!isMounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-32"><p className="text-gray-400 font-bold animate-pulse">Loading Fees...</p></div>;

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
        }
      `}} />

      {/* 财务看板头部 */}
      <header className="bg-blue-600 text-white pt-safe rounded-b-[2rem] shadow-md relative overflow-hidden no-print">
        <div className="absolute inset-0 bg-blue-700/20 pointer-events-none"></div>
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-black">Fee Collection Management</h1>
            <button onClick={() => window.print()} className="flex items-center space-x-1 text-xs font-bold bg-white text-blue-600 px-3 py-2 rounded-xl shadow-sm">
              <Download size={14} /><span>Export PDF</span>
            </button>
          </div>

          <div className="bg-blue-700/40 p-5 rounded-2xl border border-blue-500/50 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">Outstanding</p>
                <p className="text-3xl font-black">RM {totalOutstanding}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1">Collected</p>
                <p className="text-xl font-bold text-green-300">RM {totalCollected}</p>
              </div>
            </div>
            
            <div className="w-full bg-blue-900/50 rounded-full h-2.5 mt-2 overflow-hidden flex">
              <div className="bg-green-400 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${collectionRate}%` }}></div>
            </div>
          </div>
        </div>
      </header>

      {/* 核心升级：双重过滤器（时间切片 + 班级筛选） */}
      <div className="px-4 mt-4 no-print space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 时间过滤器 */}
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center">
            <CalendarRange size={18} className="text-blue-500 ml-2 mr-3 shrink-0" />
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="w-full bg-transparent font-bold text-gray-800 focus:outline-none py-2 text-sm"
            >
              <option value="TODAY">Today</option>
              <option value="LAST_WEEK">Last 7 Days (Last Week)</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="CUSTOM">Custom Date Range...</option>
            </select>
          </div>

          {/* 新增：班级筛选下拉框 */}
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm flex items-center">
            <Filter size={18} className="text-blue-500 ml-2 mr-3 shrink-0" />
            <select 
              value={selectedClassFilter} 
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full bg-transparent font-bold text-gray-800 focus:outline-none py-2 text-sm"
            >
              <option value="ALL">All Classes (所有班级)</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.name}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>

        {timeframe === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">From</label>
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">To</label>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-bold focus:outline-none" />
            </div>
          </div>
        )}

        <div className="flex bg-gray-200/60 p-1 rounded-xl">
          <button onClick={() => setActiveTab('UNPAID')} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${activeViewStyle(activeTab === 'UNPAID')}`}>UNPAID</button>
          <button onClick={() => setActiveTab('PAID')} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${activeViewStyle(activeTab === 'PAID')}`}>PAID</button>
          <button onClick={() => setActiveTab('ALL')} className={`flex-1 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all ${activeViewStyle(activeTab === 'ALL')}`}>ALL</button>
        </div>
      </div>

      {/* PDF 打印专用表头 */}
      <div className="hidden print-only mb-6">
        <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 className="text-3xl font-black text-gray-900" style={{ color: '#1e3a8a' }}>Academy Fee Collection Report</h1>
          <div className="flex justify-between mt-2 text-gray-500">
            <p className="font-bold">Filter: {getReportPeriodName()}</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* 学费记录列表 */}
      <div className="p-4 space-y-3 no-print">
        {finalFilteredRecords.map((record) => {
          const balance = record.monthlyFee - record.amountPaid;
          const isPaid = record.status === 'PAID';

          return (
            <div key={record.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all hover:border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-[15px]">{record.playerName}</p>
                  <p className="text-[11px] font-bold text-gray-400 mb-2 mt-0.5">{record.className} • Fee: RM {record.monthlyFee}</p>
                  
                  {isPaid ? (
                    <span className="inline-flex items-center text-[10px] font-black px-2 py-1 rounded-md bg-green-50 text-green-600 border border-green-100">
                      <CheckCircle2 size={12} className="mr-1" /> PAID: RM {record.amountPaid} ({record.paymentMethod})
                    </span>
                  ) : record.status === 'PARTIAL' ? (
                    <span className="inline-flex items-center text-[10px] font-black px-2 py-1 rounded-md bg-orange-50 text-orange-600 border border-orange-100">
                      <AlertCircle size={12} className="mr-1" /> PARTIAL PAID: RM {record.amountPaid} / Balance: RM {balance}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-black px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-100">
                      <AlertCircle size={12} className="mr-1" /> UNPAID: BALANCE: RM {balance}
                    </span>
                  )}
                </div>
                
                <div className="ml-4 shrink-0">
                  <button onClick={() => openPaymentModal(record)} className="text-[11px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors border border-blue-100">
                    {record.amountPaid > 0 ? 'Edit' : 'Record'}
                  </button>
                </div>
              </div>

              {record.amountPaid > 0 && (record.paymentDate || record.reference) && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex flex-col space-y-1.5">
                  {record.paymentDate && (
                    <div className="flex items-center text-[10px] font-bold text-gray-500">
                      <Calendar size={12} className="mr-1.5 text-blue-400" />
                      Paid on: <span className="text-gray-700 ml-1">{record.paymentDate}</span>
                    </div>
                  )}
                  {record.reference && (
                    <div className="flex items-center text-[10px] font-bold text-gray-500">
                      <Receipt size={12} className="mr-1.5 text-blue-400" />
                      Ref: <span className="text-gray-700 ml-1">{record.reference}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {finalFilteredRecords.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 font-bold text-sm">No fee records found for this class and period.</p>
          </div>
        )}
      </div>

      {/* 打印专用的表格视图 */}
      <div className="hidden print-only">
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Class</th>
              <th>Due</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {finalFilteredRecords.map((r, i) => (
              <tr key={i}>
                <td>{r.playerName}</td>
                <td>{r.className}</td>
                <td>RM {r.monthlyFee}</td>
                <td>RM {r.amountPaid}</td>
                <td>RM {r.monthlyFee - r.amountPaid}</td>
                <td>{r.status}</td>
                <td>{r.paymentDate || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 收款录入弹窗 --- */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-[60] no-print">
          <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            <div className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-white rounded-t-[2rem] z-10 flex justify-between items-start">
              <div>
                <h3 className="font-black text-2xl leading-tight text-gray-900">{selectedRecord.playerName}</h3>
                <p className="text-xs font-bold text-gray-500 mt-1">{selectedRecord.className}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 bg-gray-100 rounded-full p-2 font-bold active:bg-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-gray-50/50">
              
              <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-2">Total Paid Amount (RM)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="font-black text-gray-400">RM</span>
                  </div>
                  <input 
                    type="number" 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)} 
                    className="w-full bg-blue-50/50 border-none rounded-xl pl-12 pr-4 py-4 text-3xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-2 text-right">
                  Monthly Fee Due: RM {selectedRecord.monthlyFee}
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">Payment Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-3.5 text-gray-400" />
                  <input 
                    type="date" 
                    value={paymentDate} 
                    onChange={(e) => setPaymentDate(e.target.value)} 
                    className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod('Bank Transfer')} className={`py-3 rounded-xl border text-xs font-black transition-colors flex justify-center items-center ${paymentMethod === 'Bank Transfer' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                    <CreditCard size={14} className="mr-1.5" /> Bank Transfer
                  </button>
                  <button onClick={() => setPaymentMethod('Cash')} className={`py-3 rounded-xl border text-xs font-black transition-colors flex justify-center items-center ${paymentMethod === 'Cash' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                    <Banknote size={14} className="mr-1.5" /> Cash
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 ml-1">Receipt / Reference No.</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="e.g. REF-123456" 
                    value={receiptRef} 
                    onChange={(e) => setReceiptRef(e.target.value)} 
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
                  />
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-xl flex items-center justify-center transition-colors border border-gray-200 shadow-sm" title="Upload Receipt">
                    <UploadCloud size={20} />
                  </button>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 shrink-0 bg-white">
              <button 
                onClick={handleSavePayment}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center space-x-2 active:bg-blue-700 transition-colors shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
              >
                <ShieldCheck size={20} />
                <span>Save Payment Record</span>
              </button>
            </div>
            
          </div>
        </div>
      )}
    </main>
  );
}

function activeViewStyle(isActive: boolean) {
  return isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700';
}
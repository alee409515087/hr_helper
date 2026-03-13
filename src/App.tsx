/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Trophy, 
  LayoutGrid, 
  Upload, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Settings2,
  FileText,
  UserPlus,
  History,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { Person, Group, Winner } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'list' | 'draw' | 'group'>('list');
  const [people, setPeople] = useState<Person[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Lucky Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Person | null>(null);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [prizeName, setPrizeName] = useState('');
  const [drawPool, setDrawPool] = useState<Person[]>([]);

  // Grouping State
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<Group[]>([]);

  // Duplicate detection
  const duplicateNames = people.filter((p, index) => 
    people.findIndex(other => other.name === p.name) !== index
  ).map(p => p.name);
  const hasDuplicates = duplicateNames.length > 0;

  const loadMockData = () => {
    const MOCK_DATA: Person[] = [
      { id: `mock-${Date.now()}-1`, name: '陳小明', department: '行銷部' },
      { id: `mock-${Date.now()}-2`, name: '張雅婷', department: '工程部' },
      { id: `mock-${Date.now()}-3`, name: '李威廉', department: '人事部' },
      { id: `mock-${Date.now()}-4`, name: '王大同', department: '業務部' },
      { id: `mock-${Date.now()}-5`, name: '林美玲', department: '財務部' },
      { id: `mock-${Date.now()}-6`, name: '趙子龍', department: '工程部' },
      { id: `mock-${Date.now()}-7`, name: '孫悟空', department: '行銷部' },
      { id: `mock-${Date.now()}-8`, name: '周杰倫', department: '設計部' },
      { id: `mock-${Date.now()}-9`, name: '林俊傑', department: '設計部' },
      { id: `mock-${Date.now()}-10`, name: '蔡依林', department: '行銷部' },
    ];
    setPeople(prev => [...prev, ...MOCK_DATA]);
  };

  const removeDuplicates = () => {
    const seen = new Set();
    const uniquePeople = people.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    setPeople(uniquePeople);
  };

  const downloadGroupsCSV = () => {
    if (groups.length === 0) return;
    const data = groups.flatMap(g => 
      g.members.map(m => ({
        '組別': g.name,
        '姓名': m.name,
        '部門': m.department || ''
      }))
    );
    const csv = Papa.unparse(data);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', '分組結果.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sync draw pool when people change
  useEffect(() => {
    if (!allowRepeat) {
      const winnerIds = new Set(winners.map(w => w.person.id));
      setDrawPool(people.filter(p => !winnerIds.has(p.id)));
    } else {
      setDrawPool(people);
    }
  }, [people, winners, allowRepeat]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newPeople: Person[] = results.data.map((row: any, index) => ({
          id: `csv-${Date.now()}-${index}`,
          name: row.name || row.Name || Object.values(row)[0] as string,
          department: row.department || row.Department || ''
        })).filter(p => p.name);
        setPeople(prev => [...prev, ...newPeople]);
      }
    });
  };

  const handleAddFromText = () => {
    const names = inputText.split(/[\n,]+/).map(s => s.trim()).filter(s => s);
    const newPeople: Person[] = names.map((name, index) => ({
      id: `text-${Date.now()}-${index}`,
      name,
    }));
    setPeople(prev => [...prev, ...newPeople]);
    setInputText('');
  };

  const removePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id));
  };

  const clearAll = () => {
    if (confirm('確定要清除所有名單嗎？')) {
      setPeople([]);
      setWinners([]);
      setGroups([]);
    }
  };

  const startDraw = () => {
    if (drawPool.length === 0) return;
    setIsDrawing(true);
    setCurrentWinner(null);

    let count = 0;
    const maxCount = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * drawPool.length);
      setCurrentWinner(drawPool[randomIndex]);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        const finalWinner = drawPool[Math.floor(Math.random() * drawPool.length)];
        setCurrentWinner(finalWinner);
        setIsDrawing(false);
        setWinners(prev => [{ person: finalWinner, timestamp: Date.now(), prize: prizeName }, ...prev]);
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      }
    }, 50);
  };

  const handleGrouping = () => {
    if (people.length === 0) return;
    const shuffled = [...people].sort(() => Math.random() - 0.5);
    const newGroups: Group[] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push({
        id: `group-${i}`,
        name: `第 ${Math.floor(i / groupSize) + 1} 組`,
        members: shuffled.slice(i, i + groupSize)
      });
    }
    setGroups(newGroups);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Users size={24} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">HR 小助手</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Lucky Draw & Grouping</p>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <TabButton 
              active={activeTab === 'list'} 
              onClick={() => setActiveTab('list')}
              icon={<FileText size={18} />}
              label="名單管理"
            />
            <TabButton 
              active={activeTab === 'draw'} 
              onClick={() => setActiveTab('draw')}
              icon={<Trophy size={18} />}
              label="獎品抽籤"
            />
            <TabButton 
              active={activeTab === 'group'} 
              onClick={() => setActiveTab('group')}
              icon={<LayoutGrid size={18} />}
              label="自動分組"
            />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-6">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Upload size={20} className="text-indigo-600" />
                    上傳名單
                  </h2>
                  <div className="space-y-4">
                    <button 
                      onClick={loadMockData}
                      className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-200"
                    >
                      <Sparkles size={18} className="text-amber-500" />
                      載入模擬名單
                    </button>

                    <div className="relative group">
                      <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center group-hover:border-indigo-400 transition-colors bg-slate-50/50">
                        <Upload className="mx-auto mb-2 text-slate-400 group-hover:text-indigo-500" size={32} />
                        <p className="text-sm font-medium text-slate-600">點擊或拖拽 CSV 檔案</p>
                        <p className="text-xs text-slate-400 mt-1">首欄將被視為姓名</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400 font-semibold">或</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">手動貼上名單</label>
                      <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="每行一個姓名，或用逗號隔開..."
                        className="w-full h-32 p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                      />
                      <button 
                        onClick={handleAddFromText}
                        disabled={!inputText.trim()}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        加入名單
                      </button>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">統計數據</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">總人數</p>
                      <p className="text-3xl font-bold text-indigo-600">{people.length}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">已中獎</p>
                      <p className="text-3xl font-bold text-emerald-600">{winners.length}</p>
                    </div>
                  </div>

                  {hasDuplicates && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex gap-3">
                        <AlertCircle className="text-amber-600 shrink-0" size={20} />
                        <div>
                          <p className="text-sm font-bold text-amber-900">發現重複姓名</p>
                          <p className="text-xs text-amber-700 mt-1">
                            有 {new Set(duplicateNames).size} 個姓名重複出現。
                          </p>
                          <button 
                            onClick={removeDuplicates}
                            className="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-800"
                          >
                            點此一次性移除重複項
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={clearAll}
                    className="w-full mt-6 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    清除所有數據
                  </button>
                </section>
              </div>

              <div className="lg:col-span-2">
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Users size={20} className="text-indigo-600" />
                      目前名單
                    </h2>
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                      {people.length} 人
                    </span>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto">
                    {people.length === 0 ? (
                      <div className="p-20 text-center">
                        <Users className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-medium">尚未匯入任何名單</p>
                      </div>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">姓名</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">部門/備註</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {people.map((person) => {
                            const isDuplicate = people.filter(p => p.name === person.name).length > 1;
                            return (
                              <tr key={person.id} className={cn(
                                "hover:bg-slate-50/50 transition-colors group",
                                isDuplicate && "bg-amber-50/30"
                              )}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                      {person.name.charAt(0)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-slate-700">{person.name}</span>
                                      {isDuplicate && (
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">重複</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                  {person.department || '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => removePerson(person.id)}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'draw' && (
            <motion.div
              key="draw"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  
                  <div className="max-w-md mx-auto space-y-8 py-12">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">幸運大抽獎</h2>
                      <p className="text-slate-500 font-medium">
                        {isDrawing ? '正在為您挑選幸運兒...' : `待抽池中還有 ${drawPool.length} 位候選人`}
                      </p>
                    </div>

                    <div className="relative h-48 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                      <AnimatePresence mode="wait">
                        {currentWinner ? (
                          <motion.div
                            key={currentWinner.id}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.8 }}
                            className="text-center"
                          >
                            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-2">Winner</p>
                            <h3 className="text-5xl font-black text-slate-900">{currentWinner.name}</h3>
                            {currentWinner.department && (
                              <p className="text-slate-500 mt-2 font-medium">{currentWinner.department}</p>
                            )}
                          </motion.div>
                        ) : (
                          <div className="text-slate-300 flex flex-col items-center gap-2">
                            <Trophy size={48} strokeWidth={1.5} />
                            <p className="font-bold text-sm uppercase tracking-widest">Ready to Draw</p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="輸入獎項名稱 (選填)"
                          value={prizeName}
                          onChange={(e) => setPrizeName(e.target.value)}
                          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <button 
                        onClick={startDraw}
                        disabled={isDrawing || drawPool.length === 0}
                        className={cn(
                          "w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3",
                          isDrawing || drawPool.length === 0 
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200"
                        )}
                      >
                        {isDrawing ? (
                          <RotateCcw className="animate-spin" />
                        ) : (
                          <Trophy />
                        )}
                        {isDrawing ? '抽獎中...' : '開始抽獎'}
                      </button>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <History size={20} className="text-indigo-600" />
                      中獎紀錄
                    </h2>
                    <button 
                      onClick={() => setWinners([])}
                      className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                    >
                      清除紀錄
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {winners.length === 0 ? (
                      <p className="text-center py-8 text-slate-400 text-sm font-medium italic">尚無中獎紀錄</p>
                    ) : (
                      winners.map((winner, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={winner.timestamp}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 font-bold">
                              {winners.length - idx}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{winner.person.name}</p>
                              <p className="text-xs text-slate-500 font-medium">
                                {winner.prize ? `獎項：${winner.prize}` : '一般抽籤'} • {new Date(winner.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <CheckCircle2 className="text-emerald-500" size={20} />
                        </motion.div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-1">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Settings2 size={20} className="text-indigo-600" />
                    抽獎設定
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">重複中獎</p>
                        <p className="text-xs text-slate-500">允許同一個人多次中獎</p>
                      </div>
                      <button 
                        onClick={() => setAllowRepeat(!allowRepeat)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          allowRepeat ? "bg-indigo-600" : "bg-slate-300"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          allowRepeat ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="flex gap-3">
                        <AlertCircle className="text-indigo-600 shrink-0" size={20} />
                        <div>
                          <p className="text-sm font-bold text-indigo-900">抽獎池狀態</p>
                          <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                            目前池中有 <span className="font-black">{drawPool.length}</span> 位成員。
                            {!allowRepeat && winners.length > 0 && `已排除 ${winners.length} 位中獎者。`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">自動分組工具</h2>
                    <p className="text-sm text-slate-500 font-medium">根據設定的人數自動隨機分配組別</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                      <span className="pl-3 text-sm font-bold text-slate-600">每組人數</span>
                      <input 
                        type="number" 
                        min="2" 
                        max={people.length}
                        value={groupSize}
                        onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                        className="w-16 px-2 py-2 bg-white border border-slate-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button 
                      onClick={handleGrouping}
                      disabled={people.length === 0}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
                    >
                      <RotateCcw size={18} />
                      重新分組
                    </button>
                    {groups.length > 0 && (
                      <button 
                        onClick={downloadGroupsCSV}
                        className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                      >
                        <Download size={18} />
                        下載 CSV
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {groups.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                  <LayoutGrid className="mx-auto text-slate-200 mb-4" size={64} />
                  <h3 className="text-xl font-bold text-slate-400">點擊按鈕開始分組</h3>
                  <p className="text-slate-400 mt-2">系統將根據目前名單進行隨機分配</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groups.map((group, idx) => (
                    <motion.div 
                      key={group.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col"
                    >
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-black text-slate-900">{group.name}</h3>
                        <span className="text-[10px] font-black bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
                          {group.members.length} MEMBERS
                        </span>
                      </div>
                      <div className="p-4 flex-1 space-y-2">
                        {group.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">
                              {member.name.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 font-medium">© 2026 HR Assistant Tool. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Terms</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all",
        active 
          ? "bg-white text-indigo-600 shadow-sm" 
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

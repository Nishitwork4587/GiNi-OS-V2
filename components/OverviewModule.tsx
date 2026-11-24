"use client";

import React, { useState, useEffect } from 'react';
import { 
  fetchTasks, toggleTaskInDb, fetchCalendarEvents, deleteCalendarEventFromDb, addCalendarEventToDb,
  fetchHabits, fetchExpenses, fetchNotes
} from '../app/actions';
import {
  CheckCircle2, Activity, ArrowRight, TrendingUp, Circle, Plus, X, Trash2, Flame, Wallet, BookOpen, Sparkles
} from 'lucide-react';

// --- Components ---
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#131315] border border-white/5 rounded-2xl shadow-sm ${className}`}>
    {children}
  </div>
);

const PriorityIndicator = ({ priority }: { priority: 'high' | 'medium' | 'low' }) => {
  const colors: Record<'high' | 'medium' | 'low', string> = {
    high: 'text-red-400 bg-red-400/10',
    medium: 'text-blue-400 bg-blue-400/10',
    low: 'text-emerald-400 bg-emerald-400/10'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${colors[priority]}`}>
      {priority}
    </span>
  );
};

// --- Skeleton Loaders ---
const SkeletonRow = () => (
  <div className="flex items-center gap-3 p-2 -mx-2">
    <div className="w-5 h-5 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
    <div className="flex-1 h-4 bg-white/5 rounded-md animate-pulse" />
    <div className="w-12 h-4 bg-white/5 rounded-md animate-pulse flex-shrink-0" />
  </div>
);

const SkeletonRingDashboard = () => (
  <div className="bg-[#131315] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
    <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
      <div className="w-36 h-36 rounded-full border-[10px] border-white/5 animate-pulse" />
      <div className="absolute w-24 h-24 rounded-full border-[10px] border-white/5 animate-pulse" />
      <div className="absolute w-12 h-12 rounded-full border-[10px] border-white/5 animate-pulse" />
    </div>
    <div className="flex-1 w-full space-y-6 z-10">
      <div className="space-y-2">
        <div className="h-6 w-1/3 bg-white/5 rounded-md animate-pulse" />
        <div className="h-4 w-1/2 bg-white/5 rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-black/40 rounded-xl p-3 border border-white/5 h-20 animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

// --- Apple Fitness Style Activity Rings ---
const OverviewActivityRings = ({ taskPercent, habitPercent, productivityScore }: { taskPercent: number, habitPercent: number, productivityScore: number }) => {
  const rOuter = 46;
  const rMiddle = 32;
  const rInner = 18;
  
  const cOuter = 2 * Math.PI * rOuter;
  const cMiddle = 2 * Math.PI * rMiddle;
  const cInner = 2 * Math.PI * rInner;

  return (
    <div className="bg-[#131315] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
        <svg className="transform -rotate-90 w-36 h-36 drop-shadow-xl">
          <circle cx="72" cy="72" r={rOuter} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-blue-500/10" />
          <circle cx="72" cy="72" r={rMiddle} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-emerald-500/10" />
          <circle cx="72" cy="72" r={rInner} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
          
          <circle
            cx="72" cy="72" r={rOuter} stroke="currentColor" strokeWidth="10" fill="transparent"
            strokeDasharray={cOuter} strokeDashoffset={cOuter - (taskPercent / 100) * cOuter}
            strokeLinecap="round" className="text-blue-500 transition-all duration-1000 ease-out"
          />
          <circle
            cx="72" cy="72" r={rMiddle} stroke="currentColor" strokeWidth="10" fill="transparent"
            strokeDasharray={cMiddle} strokeDashoffset={cMiddle - (habitPercent / 100) * cMiddle}
            strokeLinecap="round" className="text-emerald-400 transition-all duration-1000 ease-out delay-150"
          />
          <circle
            cx="72" cy="72" r={rInner} stroke="currentColor" strokeWidth="10" fill="transparent"
            strokeDasharray={cInner} strokeDashoffset={cInner - (productivityScore / 100) * cInner}
            strokeLinecap="round" className="text-neutral-300 transition-all duration-1000 ease-out delay-300"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <Sparkles size={16} className={taskPercent === 100 && habitPercent === 100 && taskPercent > 0 ? "text-emerald-400" : "text-neutral-400"} />
        </div>
      </div>

      <div className="flex-1 w-full space-y-4 z-10">
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">Daily Progress</h2>
          <p className="text-sm text-neutral-400">Your live activity rings for today.</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Tasks</span>
            </div>
            <span className="text-xl font-bold text-neutral-100">{Math.round(taskPercent)}%</span>
          </div>
          
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Habits</span>
            </div>
            <span className="text-xl font-bold text-neutral-100">{Math.round(habitPercent)}%</span>
          </div>

          <div className="bg-black/40 rounded-xl p-3 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 text-neutral-300 mb-1">
              <div className="w-2 h-2 rounded-full bg-neutral-300" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Score</span>
            </div>
            <span className="text-xl font-bold text-neutral-100">{Math.min(100, Math.round(productivityScore))}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OverviewModule({ searchQuery = "" }: { searchQuery?: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dbTasks, dbEvents, dbHabits, dbExpenses, dbNotes] = await Promise.all([
        fetchTasks(),
        fetchCalendarEvents(),
        fetchHabits(),
        fetchExpenses(),
        fetchNotes()
      ]);
      setTasks(dbTasks || []);
      setEvents(dbEvents || []);
      setHabits(dbHabits || []);
      setExpenses(dbExpenses || []);
      setNotes(dbNotes || []);
    } catch (error) {
      console.error("Failed to load overview data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleTask = async (id: number, currentStatus: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    await toggleTaskInDb(id, currentStatus);
  };

  const deleteEvent = async (id: number) => {
    if (confirm("Delete this event?")) {
      await deleteCalendarEventFromDb(id);
      loadData();
    }
  };

  const handleQuickAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    await addCalendarEventToDb(newEventTitle, todayStr, newEventTime, 'meeting', 'blue');

    setNewEventTitle('');
    setIsAddingEvent(false);
    loadData();
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Dynamic Calculations for Rings
  const completedCount = tasks.filter((t: any) => t.done).length;
  const totalCount = tasks.length;
  const taskPercent = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
  
  const completedHabits = habits.filter((h: any) => h.completed_dates && h.completed_dates.includes(todayStr)).length;
  const totalHabits = habits.length;
  const habitPercent = totalHabits === 0 ? 0 : (completedHabits / totalHabits) * 100;
  
  const productivityScore = (taskPercent * 0.6) + (habitPercent * 0.4) + (tasks.length > 0 ? 15 : 0); 

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-5xl mx-auto">
      
      {/* 1. Master Progress Rings with Skeleton Fallback */}
      {isLoading ? (
        <SkeletonRingDashboard />
      ) : (
        <OverviewActivityRings 
          taskPercent={taskPercent} 
          habitPercent={habitPercent} 
          productivityScore={productivityScore} 
        />
      )}

      {/* 2. Middle Row: Tasks & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Module */}
        <Card className="lg:col-span-2 p-5 flex flex-col border-white/5 hover:border-blue-500/20 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-neutral-200">Active Tasks</h2>
          </div>

          {isLoading ? (
            <div className="flex-1 space-y-3 pt-2">
              {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : (
            <div className="flex-1 space-y-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTasks.map((task: any) => (
                <div key={task.id} className="group flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <button
                    onClick={() => toggleTask(task.id, task.done)}
                    className="flex-shrink-0 text-neutral-600 hover:text-blue-400 transition-colors focus:outline-none"
                  >
                    {task.done ? <CheckCircle2 size={18} className="text-blue-500" /> : <Circle size={18} />}
                  </button>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <span className={`text-sm truncate ${task.done ? 'text-neutral-600 line-through' : 'text-neutral-200'}`}>
                        {task.title}
                      </span>
                      {!task.done && <PriorityIndicator priority={task.priority} />}
                    </div>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-sm text-neutral-500 text-center py-6">No tasks match your view.</div>
              )}
            </div>
          )}
        </Card>

        {/* Schedule Module */}
        <Card className="lg:col-span-1 p-5 flex flex-col border-white/5 hover:border-emerald-500/20 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-semibold text-neutral-200">Today's Schedule</h2>
            <button
              onClick={() => setIsAddingEvent(!isAddingEvent)}
              className="text-neutral-400 hover:text-blue-400 transition-colors bg-white/5 hover:bg-blue-500/20 p-1 rounded-md"
            >
              {isAddingEvent ? <X size={16} /> : <Plus size={16} />}
            </button>
          </div>

          {isAddingEvent && (
            <form onSubmit={handleQuickAddEvent} className="mb-4 space-y-2 bg-black/40 p-3 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
              <input
                type="text"
                placeholder="Event Title..."
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full bg-[#131315] border border-white/10 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500"
                autoFocus
                required
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  className="flex-1 bg-[#131315] border border-white/10 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  required
                />
                <button type="submit" className="bg-blue-500 text-white px-3 rounded-lg text-xs font-medium hover:bg-blue-600">Add</button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="relative border-l border-white/10 ml-2 space-y-8 flex-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative pl-5">
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#09090b] bg-white/10 animate-pulse" />
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative border-l border-white/10 ml-2 space-y-6 max-h-[300px] overflow-y-auto pr-2 flex-1 custom-scrollbar">
              {events.slice(0, 5).map((event: any) => (
                <div key={event.id} className="relative pl-5 group">
                  <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#09090b] ${event.color === 'green' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[11px] font-medium text-neutral-500 mb-0.5">{event.event_date} @ {event.start_time}</p>
                      <p className="text-sm text-neutral-200">{event.title}</p>
                    </div>
                    <button onClick={() => deleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {events.length === 0 && <div className="text-sm text-neutral-500 pl-5 text-center py-6">No upcoming meetings.</div>}
            </div>
          )}
        </Card>
      </div>

      {/* 3. Bottom Row: Habits, Expenses, Notes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Habits Summary */}
        <Card className="p-5 flex flex-col border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Flame size={16} className="text-emerald-400" /> Daily Habits
            </h2>
          </div>
          {isLoading ? (
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-6 w-full bg-white/5 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {habits.slice(0, 4).map(habit => {
                const isDoneToday = habit.completed_dates && habit.completed_dates.includes(todayStr);
                const totalChecks = habit.completed_dates ? habit.completed_dates.length : 0;
                return (
                  <div key={habit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center ${isDoneToday ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                        {isDoneToday && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm truncate ${isDoneToday ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>{habit.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-neutral-400 flex items-center gap-1 flex-shrink-0">
                      <Flame size={10} className={totalChecks > 5 ? 'text-emerald-400' : 'text-neutral-500'} /> {totalChecks}
                    </span>
                  </div>
                );
              })}
              {habits.length === 0 && <div className="text-xs text-neutral-500 text-center py-6">No habits created yet.</div>}
            </div>
          )}
        </Card>

        {/* Expenses Summary */}
        <Card className="p-5 flex flex-col border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <Wallet size={16} className="text-blue-400" /> Recent Finances
            </h2>
          </div>
          {isLoading ? (
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-10 w-full bg-white/5 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {expenses.slice(0, 3).map(exp => {
                const isIncome = exp.type === 'Income' || exp.category?.toLowerCase() === 'income' || parseFloat(exp.amount) > 0;
                const amt = Math.abs(parseFloat(exp.amount) || 0);
                return (
                  <div key={exp.id} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="truncate pr-4">
                      <p className="text-sm text-neutral-200 truncate">{exp.title || exp.description || exp.category}</p>
                      <p className="text-[10px] text-neutral-500">{formatDateShort(exp.date)}</p>
                    </div>
                    <span className={`text-sm font-medium flex-shrink-0 ${isIncome ? 'text-emerald-400' : 'text-neutral-200'}`}>
                      {isIncome ? '+' : '-'}₹{amt.toLocaleString()}
                    </span>
                  </div>
                );
              })}
              {expenses.length === 0 && <div className="text-xs text-neutral-500 text-center py-6">No transactions found.</div>}
            </div>
          )}
        </Card>

        {/* Notes Summary */}
        <Card className="p-5 flex flex-col border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <BookOpen size={16} className="text-neutral-400" /> Recent Notes
            </h2>
          </div>
          {isLoading ? (
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 w-full bg-white/5 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="flex-1 space-y-3">
              {notes.slice(0, 3).map(note => (
                <div key={note.id} className="group hover:bg-white/[0.03] p-2 -mx-2 rounded-lg transition-colors overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1 gap-2">
                    <p className="text-sm text-neutral-200 group-hover:text-blue-400 transition-colors truncate">{note.title}</p>
                    <p className="text-[10px] text-neutral-500 flex-shrink-0">{formatDateShort(note.updated_at)}</p>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    {note.content ? note.content : 'No content...'}
                  </p>
                </div>
              ))}
              {notes.length === 0 && <div className="text-xs text-neutral-500 text-center py-6">No notes created yet.</div>}
            </div>
          )}
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}

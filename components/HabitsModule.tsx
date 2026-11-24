"""use client""";
import React, { useState, useEffect } from 'react';
import { Target, CalendarDays, BarChart, Sparkles, AlertCircle } from 'lucide-react';
import { fetchHabits, toggleHabitDateInDb } from '../app/actions';

export default function HabitsModule({ searchQuery = "" }: { searchQuery?: string }) {
  const [habits, setHabits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'monthly' | 'yearly'>('today');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const currentDay = new Date().getDate();

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { const data = await fetchHabits(); setHabits(data || []); };

  const handleToggleDate = async (habitId: number, day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const isDone = habit.completed_dates && habit.completed_dates.includes(dateStr);
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const newDates = isDone ? h.completed_dates.filter((d: string) => d !== dateStr) : [...(h.completed_dates || []), dateStr];
        return { ...h, completed_dates: newDates };
      }
      return h;
    }));
    await toggleHabitDateInDb(habitId, dateStr, isDone);
  };

  const isDayCompleted = (habit: any, day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return habit.completed_dates && habit.completed_dates.includes(dateStr);
  };

  const completedTodayCount = habits.filter(h => isDayCompleted(h, currentDay)).length;
  const todayPercent = habits.length === 0 ? 0 : Math.round((completedTodayCount / habits.length) * 100);

  const totalCompletedThisMonth = habits.reduce((total, habit) => total + (habit.completed_dates ? habit.completed_dates.filter((d: string) => d.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length : 0), 0);
  const totalPossibleThisMonth = habits.length * daysInMonth;
  const overallMonthPercent = totalPossibleThisMonth === 0 ? 0 : Math.round((totalCompletedThisMonth / totalPossibleThisMonth) * 100);

  const totalCompletedThisYear = habits.reduce((total, habit) => total + (habit.completed_dates ? habit.completed_dates.filter((d: string) => d.startsWith(`${currentYear}`)).length : 0), 0);
  const totalPossibleThisYear = habits.length * 365;
  const overallYearPercent = totalPossibleThisYear === 0 ? 0 : Math.round((totalCompletedThisYear / totalPossibleThisYear) * 100);

  const generateInsights = (habit: any) => {
    const monthCompleted = habit.completed_dates ? habit.completed_dates.filter((d: string) => d.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`)).length : 0;
    const rate = Math.round((monthCompleted / daysInMonth) * 100);
    if (rate >= 80) return { text: "Outstanding consistency! You are mastering this habit.", color: "text-emerald-400", bg: "bg-emerald-500/10" };
    if (rate >= 50) return { text: "Good progress, but try to minimize missed days.", color: "text-blue-400", bg: "bg-blue-500/10" };
    return { text: "Needs improvement. Focus on building a small daily streak.", color: "text-amber-400", bg: "bg-amber-500/10" };
  };

  // Filter based on searchQuery
  const filteredHabits = habits.filter(habit => 
    (habit.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
            Habit Mastery <Sparkles className="text-emerald-400" size={20} />
          </h1>
          <p className="text-sm text-neutral-400 mt-1">Track daily execution, monthly trends, and long-term insights.</p>
        </div>
        <div className="flex bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full p-1 shadow-inner relative">
          <button onClick={() => setActiveTab('today')} className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${activeTab === 'today' ? 'bg-white/10 text-emerald-400' : 'text-neutral-400'}`}><Target size={16} /> Today</button>
          <button onClick={() => setActiveTab('monthly')} className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${activeTab === 'monthly' ? 'bg-white/10 text-blue-400' : 'text-neutral-400'}`}><CalendarDays size={16} /> Monthly</button>
          <button onClick={() => setActiveTab('yearly')} className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium rounded-full transition-colors flex items-center justify-center gap-2 ${activeTab === 'yearly' ? 'bg-white/10 text-purple-400' : 'text-neutral-400'}`}><BarChart size={16} /> Yearly</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131315] p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-medium text-neutral-400 mb-2">Today's Progress</h3>
          <p className="text-3xl font-bold text-emerald-400">{todayPercent}%</p>
        </div>
        <div className="bg-[#131315] p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-medium text-neutral-400 mb-2">Monthly Consistency</h3>
          <p className="text-3xl font-bold text-blue-400">{overallMonthPercent}%</p>
        </div>
        <div className="bg-[#131315] p-6 rounded-2xl border border-white/5">
          <h3 className="text-sm font-medium text-neutral-400 mb-2">Yearly Consistency</h3>
          <p className="text-3xl font-bold text-purple-400">{overallYearPercent}%</p>
        </div>
      </div>

      <div className="bg-[#131315] rounded-2xl border border-white/5 divide-y divide-white/5 p-6">
        <h2 className="text-base font-semibold text-neutral-200 mb-6">Habit Evaluation & Improvement</h2>
        <div className="space-y-4">
          {filteredHabits.map((habit) => {
            const insight = generateInsights(habit);
            return (
              <div key={habit.id} className={`p-4 rounded-xl border border-white/5 ${insight.bg}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-neutral-200">{habit.title}</h3>
                  <AlertCircle size={16} className={insight.color} />
                </div>
                <p className={`text-xs ${insight.color}`}>{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

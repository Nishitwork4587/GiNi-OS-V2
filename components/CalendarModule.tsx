"use client";
import React, { useState, useEffect } from 'react';
import { fetchTasks, fetchCalendarEvents, addCalendarEventToDb, deleteCalendarEventFromDb } from '../app/actions';
import { Plus, Sparkles, CalendarDays, Trash2, CheckCircle2, X, ChevronLeft, ChevronRight, LayoutList, ArrowLeft } from 'lucide-react';

export default function CalendarModule({ searchQuery = "" }: { searchQuery?: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<'view' | 'add'>('view');
  const [selectedDateStr, setSelectedDateStr] = useState('');
  
  // Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventType, setNewEventType] = useState('meeting');
  const [newEventColor, setNewEventColor] = useState('blue');

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    loadData();
  }, [currentMonth, currentYear]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dbTasks, dbEvents] = await Promise.all([
        fetchTasks(),
        fetchCalendarEvents()
      ]);
      setTasks(dbTasks || []);
      setEvents(dbEvents || []);
    } catch (error) {
      console.error("Failed to load calendar data", error);
    }
    setIsLoading(false);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !selectedDateStr) return;
    
    await addCalendarEventToDb(newEventTitle, selectedDateStr, newEventTime, newEventType, newEventColor);
    
    setNewEventTitle('');
    setPanelMode('view');
    loadData();
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm("Delete this event?")) {
      await deleteCalendarEventFromDb(id);
      loadData();
    }
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setPanelMode('view'), 300); // Reset mode after transition
  };

  // Calendar Math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); 
  
  const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
  const actualDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalSlots = [...paddingDays, ...actualDays];
  
  while (totalSlots.length % 7 !== 0) {
    totalSlots.push(null);
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getItemsForDate = (day: number | null) => {
    if (!day) return { dayTasks: [], dayEvents: [], dateStr: '' };
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayTasks = tasks.filter(t => 
      (t.dueDate === dateStr || (t.time && t.time.startsWith(dateStr))) && 
      (searchQuery === "" || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const dayEvents = events.filter(e => 
      e.event_date === dateStr &&
      (searchQuery === "" || e.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return { dayTasks, dayEvents, dateStr };
  };

  // Selected Date Details
  const selectedDayEvents = events.filter(e => 
    e.event_date === selectedDateStr && 
    (searchQuery === "" || e.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const selectedDayTasks = tasks.filter(t => 
    (t.dueDate === selectedDateStr || (t.time && t.time.startsWith(selectedDateStr))) &&
    (searchQuery === "" || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const formattedSelectedDate = selectedDateStr ? new Date(selectedDateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }) : '';

  // Filter the quick agenda events (desktop panel)
  const filteredAgendaEvents = events.filter(e => 
    searchQuery === "" || e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-24 relative">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
          Master Calendar <Sparkles className="text-blue-400" size={20} />
        </h1>
        <p className="text-sm text-neutral-400 mt-1">Schedule events and view upcoming task deadlines.</p>
      </div>

      {/* Redesigned Month Navigation Box */}
      <div className="flex items-center justify-between bg-[#131315]/90 backdrop-blur-3xl p-4 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <button onClick={prevMonth} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
          <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            {monthName} <span className="text-neutral-200">{currentYear}</span>
          </h2>
        </div>
        <button onClick={nextMonth} className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
          <span className="hidden sm:inline">Next</span> <ChevronRight size={18} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 relative">
        
        {/* Left Side: The Month Grid & Monthly Agenda */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Calendar Grid */}
          <div className="bg-[#131315]/75 backdrop-blur-3xl rounded-[32px] border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-7 border-b border-white/10 bg-black/20">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-white/[0.02]">
              {totalSlots.map((day, index) => {
                const { dayTasks, dayEvents, dateStr } = getItemsForDate(day);
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                
                return (
                  <div 
                    key={index} 
                    className={`min-h-[80px] sm:min-h-[120px] lg:min-h-[140px] p-1 sm:p-1.5 lg:p-2 border-b border-r border-white/5 relative group transition-all ${!day ? 'bg-black/20' : 'hover:bg-white/[0.05] cursor-pointer'}`}
                    onClick={() => {
                      if (day) {
                        setSelectedDateStr(dateStr);
                        setPanelMode('view');
                        setIsPanelOpen(true);
                      }
                    }}
                  >
                    {day && (
                      <>
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                          <span className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-all ${isToday ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'text-neutral-400'}`}>
                            {day}
                          </span>
                        </div>

                        {/* Mobile Indicator Dots */}
                        <div className="flex flex-wrap gap-1 mt-1 sm:hidden px-1">
                          {dayEvents.map(e => <div key={e.id} className="w-1.5 h-1.5 rounded-full bg-blue-400" />)}
                          {dayTasks.map(t => <div key={t.id} className="w-1.5 h-1.5 rounded-full bg-neutral-400" />)}
                        </div>

                        {/* Desktop Render Events & Tasks */}
                        <div className="hidden sm:block space-y-1 mt-1 overflow-y-auto max-h-[80px] hide-scrollbar">
                          {dayEvents.map(event => (
                            <div key={`ev-${event.id}`} className={`text-[9px] lg:text-[10px] px-1.5 py-1 rounded-md border flex flex-col gap-0.5 truncate cursor-default backdrop-blur-md ${
                              event.color === 'green' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 
                              event.color === 'purple' ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' :
                              'bg-blue-500/20 border-blue-500/30 text-blue-300'
                            }`}>
                              <span className="font-semibold">{event.start_time}</span>
                              <span className="truncate">{event.title}</span>
                            </div>
                          ))}
                          
                          {dayTasks.map(task => (
                            <div key={`tk-${task.id}`} className={`text-[9px] lg:text-[10px] px-1.5 py-1 rounded-md border flex flex-col gap-0.5 truncate ${
                              task.completed ? 'bg-neutral-800/50 border-neutral-700/50 text-neutral-500 line-through' : 'bg-neutral-800/80 border-neutral-600/50 text-neutral-300'
                            }`}>
                              <span className="flex items-center gap-1 font-semibold">
                                <CheckCircle2 size={10} className={task.completed ? "text-emerald-500" : "text-neutral-500"} /> Task
                              </span>
                              <span className="truncate">{task.title}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Agenda View (Below Calendar) */}
          <div className="bg-[#131315]/75 backdrop-blur-3xl rounded-[32px] border border-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hidden md:block">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <LayoutList size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{monthName} Schedule</h3>
                <p className="text-xs text-neutral-400">Date-wise agenda for this month</p>
              </div>
            </div>

            <div className="space-y-6">
              {actualDays.map(day => {
                const { dayTasks, dayEvents, dateStr } = getItemsForDate(day);
                if (dayTasks.length === 0 && dayEvents.length === 0) return null;
                const dayName = new Date(currentYear, currentMonth, day).toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={day} className="flex flex-col sm:flex-row gap-4 sm:gap-8 group">
                    <div className="flex-shrink-0 w-16 text-left sm:text-right">
                      <span className="text-sm font-bold text-neutral-300 block">{dayName}</span>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">{String(day).padStart(2, '0')}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2 border-l-2 border-white/5 pl-4 group-hover:border-blue-500/30 transition-colors">
                      {dayEvents.map(event => (
                        <div key={event.id} className="bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center justify-between group/item hover:bg-white/[0.03] transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shadow-lg ${
                              event.color === 'green' ? 'bg-emerald-500 shadow-emerald-500/50' : 
                              event.color === 'purple' ? 'bg-purple-500 shadow-purple-500/50' : 
                              event.color === 'neutral' ? 'bg-neutral-500 shadow-neutral-500/50' : 
                              'bg-blue-500 shadow-blue-500/50'
                            }`} />
                            <div>
                              <p className="text-sm font-semibold text-neutral-200">{event.title}</p>
                              <p className="text-xs text-neutral-500 font-mono mt-0.5">{event.start_time}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteEvent(event.id)} className="opacity-0 group-hover/item:opacity-100 text-neutral-600 hover:text-red-400 transition-all p-2 bg-white/5 rounded-full">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {dayTasks.map(task => (
                        <div key={task.id} className={`bg-black/20 border border-white/5 p-3 rounded-2xl flex items-center gap-3 ${task.completed ? 'opacity-50' : ''}`}>
                          <CheckCircle2 size={16} className={task.completed ? "text-emerald-500" : "text-neutral-500"} />
                          <div>
                            <p className={`text-sm font-semibold ${task.completed ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>{task.title}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 mt-1 inline-block">Task</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {actualDays.every(day => getItemsForDate(day).dayTasks.length === 0 && getItemsForDate(day).dayEvents.length === 0) && (
                <div className="text-center py-10 text-neutral-500 text-sm">
                  {searchQuery ? `No matching schedule data in ${monthName}.` : `No schedule data for ${monthName}.`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dual-Mode Side Panel / Floating Mobile Popup */}
        <div className={`
          ${isPanelOpen ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95 lg:scale-100 lg:hidden'}
          transition-all duration-300 ease-out flex-shrink-0 z-50
          fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md lg:static lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:block lg:w-[340px] lg:h-fit
        `}>
          <div className="bg-[#131315]/85 backdrop-blur-3xl lg:rounded-[32px] rounded-[32px] border border-white/10 p-6 lg:sticky lg:top-24 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-sm lg:max-w-none mx-auto relative overflow-hidden transition-all duration-300">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

            {isPanelOpen ? (
              panelMode === 'view' ? (
                /* --- MODE 1: View Date Agenda --- */
                <div className="space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Date Details</h3>
                      <p className="text-sm text-blue-400 font-medium mt-1">{formattedSelectedDate}</p>
                    </div>
                    <button onClick={closePanel} className="text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-neutral-500 mb-3">
                          <CalendarDays size={20} />
                        </div>
                        <p className="text-sm text-neutral-400">Your schedule is clear.</p>
                      </div>
                    ) : (
                      <>
                        {selectedDayEvents.map(event => (
                          <div key={event.id} className="bg-black/30 border border-white/5 p-3 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full shadow-lg ${
                                event.color === 'green' ? 'bg-emerald-500 shadow-emerald-500/50' : 
                                event.color === 'purple' ? 'bg-purple-500 shadow-purple-500/50' : 
                                event.color === 'neutral' ? 'bg-neutral-500 shadow-neutral-500/50' : 
                                'bg-blue-500 shadow-blue-500/50'
                              }`} />
                              <div>
                                <p className="text-sm font-semibold text-neutral-200">{event.title}</p>
                                <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{event.start_time}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteEvent(event.id)} className="text-neutral-600 hover:text-red-400 transition-all p-2 bg-white/5 rounded-full">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {selectedDayTasks.map(task => (
                          <div key={task.id} className={`bg-black/30 border border-white/5 p-3 rounded-2xl flex items-center gap-3 ${task.completed ? 'opacity-50' : ''}`}>
                            <CheckCircle2 size={16} className={task.completed ? "text-emerald-500" : "text-neutral-500"} />
                            <div>
                              <p className={`text-sm font-semibold ${task.completed ? 'text-neutral-500 line-through' : 'text-neutral-200'}`}>{task.title}</p>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 mt-1 inline-block">Task Deadline</span>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <button onClick={() => setPanelMode('add')} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all mt-4 flex items-center justify-center gap-2 group">
                    <Plus size={18} className="text-blue-400 group-hover:scale-110 transition-transform" /> Add to Schedule
                  </button>
                </div>
              ) : (
                /* --- MODE 2: Add Schedule Form --- */
                <div className="space-y-6 relative z-10 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPanelMode('view')} className="text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                        <ArrowLeft size={16} />
                      </button>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Add Schedule</h3>
                        <p className="text-sm text-blue-400 font-mono mt-1">{formattedSelectedDate}</p>
                      </div>
                    </div>
                    <button onClick={closePanel} className="text-neutral-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleSaveEvent} className="flex flex-col gap-5">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Event Name</label>
                      <input type="text" placeholder="e.g. Flight to NY" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 text-sm text-neutral-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-neutral-600" required autoFocus />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5 block">Start Time</label>
                      <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
                        <input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm text-neutral-200 focus:ring-0 p-0 [color-scheme:dark]" required />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2 block">Color Tag</label>
                      <div className="flex gap-3">
                        {[
                          { name: 'blue', hex: 'bg-blue-500', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.6)]' },
                          { name: 'green', hex: 'bg-emerald-500', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.6)]' },
                          { name: 'purple', hex: 'bg-purple-500', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.6)]' },
                          { name: 'neutral', hex: 'bg-neutral-500', shadow: 'shadow-[0_0_15px_rgba(115,115,115,0.6)]' }
                        ].map(c => (
                          <button 
                            key={c.name} type="button" onClick={() => setNewEventColor(c.name)} 
                            className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${newEventColor === c.name ? `border-2 border-white scale-110 ${c.shadow} ${c.hex}` : `border border-transparent opacity-40 hover:opacity-100 ${c.hex}`}`} 
                          >
                            {newEventColor === c.name && <CheckCircle2 size={16} className="text-white drop-shadow-md" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all mt-2 shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2">
                      <Plus size={18} /> Save to Calendar
                    </button>
                  </form>
                </div>
              )
            ) : (
              /* --- Desktop Default State (When nothing is selected) --- */
              <div className="text-center py-12 space-y-3 relative z-10 hidden lg:block">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto text-neutral-500 shadow-inner">
                  <CalendarDays size={26} />
                </div>
                <h3 className="text-neutral-300 font-medium text-lg">No Date Selected</h3>
                <p className="text-xs text-neutral-500 leading-relaxed px-4">Click any square on the calendar grid to view the agenda and add events.</p>
              </div>
            )}
            
            {/* Quick Agenda View (Shows on Desktop only when panel is completely closed) */}
            {!isPanelOpen && filteredAgendaEvents.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-6 hidden lg:block relative z-10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">Upcoming Schedule</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredAgendaEvents.slice(0, 5).map(event => (
                    <div key={event.id} className="flex gap-3 group items-center p-2 rounded-xl hover:bg-white/[0.03] transition-colors -mx-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        event.color === 'green' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 
                        event.color === 'purple' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 
                        event.color === 'neutral' ? 'bg-neutral-500 shadow-[0_0_8px_rgba(115,115,115,0.8)]' : 
                        'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-200 font-medium truncate">{event.title}</p>
                        <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{event.event_date} @ {event.start_time}</p>
                      </div>
                      <button onClick={() => handleDeleteEvent(event.id)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 transition-all p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

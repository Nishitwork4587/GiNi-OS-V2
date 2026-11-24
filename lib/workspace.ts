export type Module = 'Overview' | 'Projects' | 'Tasks' | 'Calendar' | 'Expenses' | 'Habits' | 'Notes';
export type ThemeSetting = 'auto' | 'light' | 'dark';
export type Project = { id: string; title: string; description: string; category: string; status: 'Active' | 'Planned' | 'Completed'; progress: number; color: string; due: string };
export type Task = { id: string; title: string; projectId: string; due: string; done: boolean; priority: 'High' | 'Medium' | 'Low' };
export type CalendarEvent = { id: string; title: string; date: string; time: string; type: 'Meeting' | 'Focus' | 'Personal' };
export type Expense = { id: string; title: string; amount: number; category: string; date: string; type: 'Expense' | 'Income' };
export type Habit = { id: string; title: string; frequency: 'Daily' | 'Weekly'; completions: string[] };
export type Note = { id: string; title: string; content: string; updatedAt: string; color: string };
export type Workspace = {
  version: 1; isDemo: boolean; theme: ThemeSetting;
  projects: Project[]; tasks: Task[]; events: CalendarEvent[]; expenses: Expense[]; habits: Habit[]; notes: Note[];
};
export const STORAGE_KEY = 'gini-os-liquid-workspace-v1';
export const uid = () => typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function localDay(date: Date = new Date()) {
  const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
export const dayOffset = (days: number) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + days); return localDay(d); };
export const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
export const dateLabel = (value: string) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No due date';
export function demoWorkspace(): Workspace {
  const today = localDay();
  return {
    version: 1, isDemo: true, theme: 'dark',
    projects: [
      { id:'p1', title:'GiNi AI Companion', description:'Build a thoughtful AI assistant for your everyday life.', category:'Personal product', status:'Active', progress:68, color:'violet', due:dayOffset(24) },
      { id:'p2', title:'Shopify Storefront', description:'Polish the mobile storefront and improve conversion.', category:'E-commerce', status:'Active', progress:82, color:'blue', due:dayOffset(12) },
      { id:'p3', title:'Creative Studio', description:'A new home for design ideas and experiments.', category:'Creative', status:'Planned', progress:24, color:'peach', due:dayOffset(42) },
    ],
    tasks: [
      { id:'t1', title:'Review new dashboard interactions', projectId:'p1', due:today, done:false, priority:'High' },
      { id:'t2', title:'Refine Shopify mobile navigation', projectId:'p2', due:today, done:false, priority:'High' },
      { id:'t3', title:'Outline GiNi assistant features', projectId:'p1', due:dayOffset(1), done:true, priority:'Medium' },
      { id:'t4', title:'Prepare launch checklist', projectId:'p2', due:dayOffset(2), done:false, priority:'Medium' },
      { id:'t5', title:'Collect visual references', projectId:'p3', due:dayOffset(4), done:false, priority:'Low' },
    ],
    events: [
      { id:'e1', title:'Focus session · GiNi AI', date:today, time:'10:00', type:'Focus' },
      { id:'e2', title:'Store design review', date:today, time:'15:30', type:'Meeting' },
      { id:'e3', title:'Weekly planning', date:dayOffset(2), time:'11:00', type:'Personal' },
    ],
    expenses: [
      { id:'x1', title:'Design resources', amount:1499, category:'Software', date:today, type:'Expense' },
      { id:'x2', title:'Project payment', amount:12500, category:'Work', date:dayOffset(-1), type:'Income' },
      { id:'x3', title:'Coffee & meetings', amount:480, category:'Food', date:dayOffset(-2), type:'Expense' },
      { id:'x4', title:'Hosting subscription', amount:899, category:'Software', date:dayOffset(-4), type:'Expense' },
      { id:'x5', title:'Travel', amount:680, category:'Travel', date:dayOffset(-6), type:'Expense' },
    ],
    habits: [
      { id:'h1', title:'Morning planning', frequency:'Daily', completions:[today,dayOffset(-1),dayOffset(-2),dayOffset(-3),dayOffset(-4)] },
      { id:'h2', title:'Deep work', frequency:'Daily', completions:[dayOffset(-1),dayOffset(-2),dayOffset(-4)] },
      { id:'h3', title:'Read 20 minutes', frequency:'Daily', completions:[today,dayOffset(-1),dayOffset(-3)] },
      { id:'h4', title:'Movement & stretch', frequency:'Daily', completions:[dayOffset(-1),dayOffset(-2)] },
    ],
    notes: [
      { id:'n1', title:'Ideas worth keeping', content:'Make GiNi OS feel calm, focused and genuinely useful. Build around daily momentum, not endless settings.', updatedAt:new Date().toISOString(), color:'violet' },
      { id:'n2', title:'Store design notes', content:'Prioritize excellent mobile performance, elegant product photography and a seamless checkout experience.', updatedAt:new Date(Date.now()-86400000).toISOString(), color:'peach' },
      { id:'n3', title:'Weekly reflections', content:'Create room for deep work. Track progress with small, consistent habits.', updatedAt:new Date(Date.now()-172800000).toISOString(), color:'blue' },
    ]
  };
}
export function emptyWorkspace(): Workspace { return { version:1,isDemo:false,theme:'dark',projects:[],tasks:[],events:[],expenses:[],habits:[],notes:[] }; }
export function validateWorkspace(data: unknown): Workspace {
  if (!data || typeof data !== 'object') throw new Error('Workspace file is missing or invalid.');
  const item = data as Record<string, unknown>;
  if (item.version !== 1) throw new Error('This workspace uses an unsupported data version.');
  for (const key of ['projects','tasks','events','expenses','habits','notes']) {
    if (!Array.isArray(item[key])) throw new Error(`Invalid ${key} data. Your saved information was not overwritten.`);
    if (!(item[key] as unknown[]).every(v => v !== null && typeof v === 'object' && typeof (v as Record<string,unknown>).id === 'string')) throw new Error(`Invalid item in ${key}. Your saved information was not overwritten.`);
  }
  return { ...(item as unknown as Workspace), theme: ['auto','light','dark'].includes(String(item.theme)) ? item.theme as ThemeSetting : 'auto', isDemo: item.isDemo === true };
}
export function getInsights(data: Workspace) {
  const today = localDay(); const completed = data.tasks.filter(x => x.done).length;
  const habitDone = data.habits.filter(x => x.completions.includes(today)).length;
  const month = today.slice(0,7);
  const spent = data.expenses.filter(x => x.type==='Expense' && x.date.startsWith(month)).reduce((a,x) => a + x.amount, 0);
  const byCategory = data.expenses.filter(x => x.type==='Expense' && x.date.startsWith(month)).reduce<Record<string,number>>((o,x) => ({...o,[x.category]:(o[x.category] || 0)+x.amount}), {});
  const top = Object.entries(byCategory).sort((a,b)=>b[1]-a[1])[0];
  return [
    { heading:'Your momentum', text: data.tasks.length ? `You’ve finished ${completed} of ${data.tasks.length} tasks. ${completed === data.tasks.length ? 'A clean slate — nice work!' : 'Finish one small task to build momentum.'}` : 'Add your first task to start building momentum.', tag:'Productivity' },
    { heading:'A little consistency', text: data.habits.length ? `${habitDone} of ${data.habits.length} habits checked in today. ${habitDone < data.habits.length ? 'A small win still counts.' : 'You are all caught up today!'}` : 'Set up a habit you can repeat on most days.', tag:'Habits' },
    { heading:'Spending snapshot', text: top ? `${top[0]} is your biggest expense category this month (${money(top[1])} of ${money(spent)}).` : 'Log a few expenses to see where your money goes.', tag:'Money' },
  ];
}

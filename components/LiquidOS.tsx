'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, CloudOff, CreditCard, Download, Flame, FolderKanban, LayoutDashboard, Lightbulb, Menu, Moon, MoreHorizontal, Pencil, Plus, RotateCcw, Search, Settings2, ShieldCheck, Sparkles, Sun, Trash2, TrendingUp, Upload, Wallet, WandSparkles, X } from 'lucide-react';
import type { CalendarEvent, Expense, Module, Note, Project, Task, ThemeSetting, Workspace } from '../lib/workspace';
import { dateLabel, dayOffset, demoWorkspace, emptyWorkspace, getInsights, localDay, money, STORAGE_KEY, uid, validateWorkspace } from '../lib/workspace';
import GlassErrorBoundary from './GlassErrorBoundary';

type IconType = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
const NAV: { name: Module; icon: IconType; description: string; tone: string }[] = [
  { name:'Overview', icon:LayoutDashboard, description:'Your daily command center',tone:'blue' },
  { name:'Projects', icon:FolderKanban, description:'Move big ideas forward',tone:'blue' },
  { name:'Tasks', icon:CheckCircle2, description:'Make room for momentum',tone:'blue' },
  { name:'Calendar', icon:CalendarDays, description:'Plan every meaningful moment',tone:'blue' },
  { name:'Expenses', icon:Wallet, description:'Understand your money',tone:'mint' },
  { name:'Habits', icon:Flame, description:'Build better days',tone:'mint' },
  { name:'Notes', icon:BookOpen, description:'Your ideas, beautifully kept',tone:'blue' },
];
const WEEK = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const nowHour = () => new Date().getHours();
const inferTheme = (choice: ThemeSetting) => choice === 'auto' ? (nowHour() >= 7 && nowHour() < 19 ? 'light' : 'dark') : choice;
const readableDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
const monthLabel = (date:Date) => date.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
const classnames = (...args:(string|false|undefined)[]) => args.filter(Boolean).join(' ');

function useLocalWorkspace() {
  const [data, setData] = useState<Workspace>(() => emptyWorkspace());
  const dataRef = useRef(data);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<{kind:'read'|'save'; detail:string}|null>(null);
  const read = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const workspace = raw === null ? demoWorkspace() : validateWorkspace(JSON.parse(raw));
      dataRef.current = workspace; setData(workspace); setError(null); setReady(true);
    } catch (e) {
      setError({kind:'read',detail:e instanceof Error ? e.message : 'Your stored workspace could not be read.'}); setReady(true);
    }
  }, []);
  useEffect(() => { read(); }, [read]);
  useEffect(() => {
    const sync = (e:StorageEvent) => { if (e.key === STORAGE_KEY) read(); };
    window.addEventListener('storage',sync); return () => window.removeEventListener('storage',sync);
  },[read]);
  const update = useCallback((fn:(current: Workspace)=>Workspace) => {
    if (!ready || error?.kind==='read') return;
    const next = fn(dataRef.current);
    dataRef.current = next; setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setError(null); }
    catch (e) { setError({kind:'save',detail:e instanceof Error? e.message : 'Saving to this browser failed.'}); }
  },[ready,error]);
  const retry = useCallback(() => {
    if (error?.kind === 'read') { read(); return; }
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(dataRef.current)); setError(null); }
    catch (e) { setError({kind:'save',detail:e instanceof Error? e.message:'Please check browser storage permissions.'}); }
  },[error,read]);
  const replace = useCallback((w:Workspace) => {
    const next = validateWorkspace(w);
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(next)); dataRef.current=next; setData(next); setError(null); setReady(true); }
    catch (e) { setError({kind:'save',detail:e instanceof Error? e.message:'Failed to store imported data.'}); }
  },[]);
  return {data,ready,error,update,retry,replace};
}

function SectionHeading({eyebrow,title,subtitle,action}:{eyebrow?:string,title:string,subtitle?:string,action?:React.ReactNode}) {
  return <div className="gini-section-heading"><div>{eyebrow&&<span className="gini-eyebrow">{eyebrow}</span>}<h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}
function GlassCard({children,className='',onClick}:{children:React.ReactNode,className?:string,onClick?:()=>void}) { return <div onClick={onClick} className={classnames('gini-glass',className)}>{children}</div>; }
function EmptyState({icon:Icon, title, description}:{icon:IconType,title:string,description:string}) { return <div className="gini-empty"><span className="gini-empty-icon"><Icon size={25}/></span><h3>{title}</h3><p>{description}</p></div>; }
function IconButton({icon:Icon,label,onClick}:{icon:IconType,label:string,onClick:()=>void}) {return <button type="button" className="gini-icon-button" aria-label={label} title={label} onClick={onClick}><Icon size={17}/></button>;}
function ModuleError({detail,retry,read}:{detail:string,retry:()=>void,read:boolean}) {
  return <GlassCard className="gini-error-card" ><CloudOff size={30}/><h2>{read?'Saved workspace could not be loaded':'Your latest changes could not be saved'}</h2><p>{detail}</p><p>{read?'Your original browser data has not been overwritten.':'Your latest changes remain visible in this open tab. Retry before closing it.'}</p><button className="gini-primary-button" onClick={retry}><RotateCcw size={16}/> Retry {read?'loading':'save'}</button></GlassCard>;
}
function ProgressRing({value,size=90,label}:{value:number,size?:number,label:string}) {
 const radius= (size-14)/2; const arc=2*Math.PI*radius;
 return <div className="gini-progress-ring" style={{width:size,height:size}} aria-label={`${label} ${Math.round(value)} percent`} role="img"><svg viewBox={`0 0 ${size} ${size}`}><circle cx={size/2} cy={size/2} r={radius} strokeWidth={9} className="gini-ring-bg"/><circle cx={size/2} cy={size/2} r={radius} strokeWidth={9} className="gini-ring-fill" strokeDasharray={arc} strokeDashoffset={arc*(1-Math.max(0,Math.min(100,value))/100)}/></svg><b>{Math.round(value)}<small>%</small></b></div>;
}

function Overview({data,navigate,update}:{data:Workspace,navigate:(m:Module)=>void,update:(fn:(d:Workspace)=>Workspace)=>void}) {
 const today=localDay();
 const done=data.tasks.filter(t=>t.done).length;
 const completedHabits=data.habits.filter(h=>h.completions.includes(today)).length;
 const taskPercent=data.tasks.length?Math.round(done/data.tasks.length*100):0;
 const habitPercent=data.habits.length?Math.round(completedHabits/data.habits.length*100):0;
 const dailyScore=Math.round(taskPercent*.65+habitPercent*.35);
 const events=[...data.events].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)).filter(e=>e.date>=today).slice(0,4);
 const transactions=[...data.expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
 const recentNotes=[...data.notes].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,3);
 const recentProjects=[...data.projects].sort((a,b)=>a.status==='Active'?-1:b.status==='Active'?1:0).slice(0,3);
 const insights=getInsights(data);
 return <div className="gini-view gini-overview">
  <GlassCard className="gini-daily-progress">
    <div className="gini-progress-art" role="img" aria-label={`Tasks ${taskPercent} percent, habits ${habitPercent} percent`}>
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <circle className="gini-daily-ring-track" cx="64" cy="64" r="49" strokeWidth="11"/>
        <circle className="gini-daily-ring-blue" cx="64" cy="64" r="49" strokeWidth="11" pathLength="100" strokeDasharray="100" strokeDashoffset={100-taskPercent}/>
        <circle className="gini-daily-ring-track" cx="64" cy="64" r="32" strokeWidth="9"/>
        <circle className="gini-daily-ring-green" cx="64" cy="64" r="32" strokeWidth="9" pathLength="100" strokeDasharray="100" strokeDashoffset={100-habitPercent}/>
      </svg>
      <span className="gini-progress-spark"><Sparkles size={24}/></span>
    </div>
    <div className="gini-daily-info"><h1>Daily Progress</h1><p>Your live activity rings for today.</p>
     <div className="gini-daily-stats">
      <div><small className="gini-blue"><i/> TASKS</small><strong>{taskPercent}%</strong></div>
      <div><small className="gini-green"><i/> HABITS</small><strong>{habitPercent}%</strong></div>
      <div><small><i/> SCORE</small><strong>{dailyScore}</strong></div>
     </div>
    </div>
  </GlassCard>
  <div className="gini-reference-main-grid">
   <GlassCard className="gini-ref-card gini-ref-tasks"><div className="gini-ref-card-title"><h2>Active Tasks</h2><button onClick={()=>navigate('Tasks')} aria-label="Open all tasks"><ArrowUpRight size={17}/></button></div>
    <div className="gini-ref-task-list">{data.tasks.slice(0,5).map(t=><label className="gini-ref-task" key={t.id}>
      <input type="checkbox" checked={t.done} onChange={()=>update(d=>({...d,isDemo:false,tasks:d.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x)}))}/><span className={t.done?'done':''}>{t.title}</span>
    </label>)}{!data.tasks.length&&<p className="gini-ref-empty">No tasks yet. Add your first task.</p>}</div>
   </GlassCard>
   <GlassCard className="gini-ref-card gini-ref-schedule"><div className="gini-ref-card-title"><h2>Today’s Schedule</h2><button onClick={()=>navigate('Calendar')} aria-label="Open calendar"><Plus size={17}/></button></div>
    <div className="gini-ref-events">{events.map(event=><button key={event.id} className="gini-ref-event" onClick={()=>navigate('Calendar')}><small>{readableDate(event.date)} · {event.time}</small><strong>{event.title}</strong></button>)}{!events.length&&<p className="gini-ref-empty">Nothing upcoming. Enjoy the breathing room.</p>}</div>
   </GlassCard>
  </div>
  <div className="gini-reference-lower-grid">
   <GlassCard className="gini-ref-card"><div className="gini-ref-card-title"><h2><Flame size={16} className="gini-green"/> Daily Habits</h2><button onClick={()=>navigate('Habits')} aria-label="View habits"><ArrowUpRight size={17}/></button></div>
    <div className="gini-ref-habit-list">{data.habits.slice(0,5).map(h=><label key={h.id} className="gini-ref-habit"><input type="checkbox" checked={h.completions.includes(today)} onChange={()=>update(d=>({...d,isDemo:false,habits:d.habits.map(x=>x.id===h.id?{...x,completions:x.completions.includes(today)?x.completions.filter(c=>c!==today):[...x.completions,today]}:x)}))}/><span className={h.completions.includes(today)?'done':''}>{h.title}</span></label>)}{!data.habits.length&&<p className="gini-ref-empty">Your daily habits will appear here.</p>}</div>
   </GlassCard>
   <GlassCard className="gini-ref-card"><div className="gini-ref-card-title"><h2><Wallet size={16} className="gini-blue"/> Recent Finances</h2><button onClick={()=>navigate('Expenses')} aria-label="View finances"><ArrowUpRight size={17}/></button></div>
    <div className="gini-ref-money-list">{transactions.map(x=><div key={x.id} className="gini-ref-money"><div><strong>{x.title}</strong><small>{readableDate(x.date)}</small></div><b className={x.type==='Income'?'gini-green':'gini-expense'}>{x.type==='Income'?'+':'−'}{money(x.amount)}</b></div>)}{!transactions.length&&<p className="gini-ref-empty">No transactions added yet.</p>}</div>
   </GlassCard>
   <GlassCard className="gini-ref-card"><div className="gini-ref-card-title"><h2><BookOpen size={16}/> Recent Notes</h2><button onClick={()=>navigate('Notes')} aria-label="Open notes"><ArrowUpRight size={17}/></button></div>
    <div className="gini-ref-notes">{recentNotes.map(note=><button key={note.id} onClick={()=>navigate('Notes')}><strong>{note.title}</strong><small>{note.content||'No content yet…'}</small></button>)}{!recentNotes.length&&<p className="gini-ref-empty">No notes created yet.</p>}</div>
   </GlassCard>
  </div>
  <div className="gini-reference-lower-grid gini-overview-extras">
   <GlassCard className="gini-ref-card"><div className="gini-ref-card-title"><h2><FolderKanban size={17} className="gini-blue"/> Projects</h2><button onClick={()=>navigate('Projects')} aria-label="Open projects"><ArrowUpRight size={17}/></button></div><div className="gini-project-preview">{recentProjects.map(p=><button key={p.id} onClick={()=>navigate('Projects')}><span><strong>{p.title}</strong><small>{p.status}</small></span><b>{p.progress}%</b></button>)}{!recentProjects.length&&<p className="gini-ref-empty">No projects created yet.</p>}</div></GlassCard>
   <GlassCard className="gini-ref-card gini-ai-ref"><div className="gini-ref-card-title"><h2><Sparkles size={17} className="gini-green"/> GiNi Insights</h2><span className="gini-ai-chip">LOCAL ANALYSIS</span></div><strong>{insights[0].heading}</strong><p>{insights[0].text}</p><small>{insights[1].text}</small></GlassCard>
  </div>
 </div>;
}

function ProjectsView({data,update}:{data:Workspace,update:(fn:(d:Workspace)=>Workspace)=>void}) {
 const [editing,setEditing]=useState<Project|null>(null);
 const [adding,setAdding]=useState(false); const [title,setTitle]=useState('');const [desc,setDesc]=useState(''); const [due,setDue]=useState(dayOffset(14));const [status,setStatus]=useState<Project['status']>('Active');
 const add=(e:React.FormEvent)=>{e.preventDefault();if(!title.trim())return;update(d=>({...d,isDemo:false,projects:[{id:uid(),title:title.trim(),description:desc,category:'Personal project',status,progress:0,color:['violet','blue','peach','mint'][d.projects.length%4],due},...d.projects]}));setTitle('');setDesc('');setAdding(false);};
 return <div className="gini-view"><SectionHeading eyebrow="" title="Projects" subtitle="Everything meaningful starts with a small step." action={<button className="gini-primary-button" onClick={()=>setAdding(!adding)}><Plus size={17}/> New project</button>}/>
 {adding&&<GlassCard className="gini-form-card"><form onSubmit={add} className="gini-form"><div className="gini-form-title">Create a project <IconButton icon={X} label="Close" onClick={()=>setAdding(false)}/></div><div className="gini-two-fields"><label>Project name<input required maxLength={120} autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Something wonderful..."/></label><label>Target date<input type="date" value={due} onChange={e=>setDue(e.target.value)}/></label></div><label>Description<textarea rows={2} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What are we building?"/></label><label>Status<select value={status} onChange={e=>setStatus(e.target.value as Project['status'])}><option>Active</option><option>Planned</option><option>Completed</option></select></label><button className="gini-primary-button" type="submit">Create project</button></form></GlassCard>}
 <div className="gini-project-grid">{data.projects.map(p=><GlassCard key={p.id} className="gini-project-card"><div className="gini-project-top"><span className={`gini-project-illustration tone-${p.color}`}><FolderKanban size={26}/></span><span className="gini-project-status">{p.status}</span></div><h3>{p.title}</h3><p>{p.description||'Your next great idea.'}</p><div className="gini-project-meta"><span><CalendarDays size={14}/>{dateLabel(p.due)}</span><span>{data.tasks.filter(t=>t.projectId===p.id).length} tasks</span></div><div className="gini-progress-caption"><span>Progress</span><strong>{p.progress}%</strong></div><input aria-label={`Progress for ${p.title}`} className="gini-progress-slider" type="range" min="0" max="100" value={p.progress} onChange={e=>update(d=>({...d,projects:d.projects.map(x=>x.id===p.id?{...x,progress:Number(e.target.value),status:Number(e.target.value)===100?'Completed':x.status}:x)}))}/><div className="gini-project-actions"><IconButton icon={Pencil} label={`Edit ${p.title}`} onClick={()=>setEditing({...p})}/><select aria-label={`Status of ${p.title}`} value={p.status} onChange={e=>update(d=>({...d,projects:d.projects.map(x=>x.id===p.id?{...x,status:e.target.value as Project['status']}:x)}))}><option>Active</option><option>Planned</option><option>Completed</option></select><IconButton icon={Trash2} label={`Delete ${p.title}`} onClick={()=>{if(window.confirm(`Delete project “${p.title}”? Its tasks will be kept.`))update(d=>({...d,projects:d.projects.filter(x=>x.id!==p.id)}));}}/></div></GlassCard>)}</div>
 {!data.projects.length&&<GlassCard><EmptyState icon={FolderKanban} title="No projects yet" description="Create your first project to get started."/></GlassCard>}
 {editing&&<div className="gini-modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setEditing(null);}}><GlassCard className="gini-edit-dialog"><form className="gini-form" onSubmit={e=>{e.preventDefault();if(!editing.title.trim())return;update(d=>({...d,projects:d.projects.map(x=>x.id===editing.id?{...editing,title:editing.title.trim()}:x)}));setEditing(null);}}><div className="gini-form-title">Edit project <IconButton icon={X} label="Close" onClick={()=>setEditing(null)}/></div><label>Project name<input required value={editing.title} maxLength={120} onChange={e=>setEditing({...editing,title:e.target.value})}/></label><label>Description<textarea rows={3} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})}/></label><div className="gini-two-fields"><label>Target date<input type="date" value={editing.due} onChange={e=>setEditing({...editing,due:e.target.value})}/></label><label>Status<select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as Project['status']})}><option>Active</option><option>Planned</option><option>Completed</option></select></label></div><label>Progress: {editing.progress}%<input type="range" min="0" max="100" value={editing.progress} onChange={e=>setEditing({...editing,progress:Number(e.target.value)})}/></label><button className="gini-primary-button" type="submit">Save project</button></form></GlassCard></div>}
 </div>;
}
function TasksView({data,update}:{data:Workspace,update:(fn:(d:Workspace)=>Workspace)=>void}) {
 const [edit,setEdit]=useState<Task|null>(null);
 const [title,setTitle]=useState(''); const [project,setProject]=useState(''); const [priority,setPriority]=useState<Task['priority']>('Medium');const [due,setDue]=useState(localDay());const [filter,setFilter]=useState<'All'|'Active'|'Completed'>('All');
 const tasks=data.tasks.filter(t=>filter==='All'||(filter==='Completed'?t.done:!t.done)).sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due));
 return <div className="gini-view"><SectionHeading eyebrow="" title="Tasks" subtitle="Organize and execute your key projects." action={<span className="gini-count-pill">{data.tasks.filter(t=>!t.done).length} remaining</span>}/><GlassCard className="gini-form-card"><form className="gini-quick-add-form" onSubmit={e=>{e.preventDefault();if(!title.trim())return;update(d=>({...d,isDemo:false,tasks:[{id:uid(),title:title.trim(),projectId:project,due,priority,done:false},...d.tasks]}));setTitle('');}}><div className="gini-input-grow"><Plus size={18}/><input aria-label="Task title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="What's on your mind today?" required maxLength={180}/></div><button className="gini-primary-button" type="submit">Add task <ArrowRight size={16}/></button><div className="gini-form-details"><select aria-label="Task project" value={project} onChange={e=>setProject(e.target.value)}><option value="">No project</option>{data.projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><select aria-label="Task priority" value={priority} onChange={e=>setPriority(e.target.value as Task['priority'])}><option>High</option><option>Medium</option><option>Low</option></select><input aria-label="Due date" type="date" value={due} onChange={e=>setDue(e.target.value)}/></div></form></GlassCard><div className="gini-segmented" role="group" aria-label="Filter tasks">{(['All','Active','Completed'] as const).map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div><div className="gini-task-groups">{tasks.length?Array.from(new Set(tasks.map(t=>t.projectId||'other'))).map(key=>{
 const project=data.projects.find(p=>p.id===key);
 const group=tasks.filter(t=>(t.projectId||'other')===key);
 return <GlassCard key={key} className="gini-task-group"><div className="gini-task-group-title"><FolderKanban size={16} className="gini-blue"/><strong>{project?.title||'Other'}</strong><span>{group.length}</span></div>{group.map(t=><div className="gini-task-row" key={t.id}><button aria-label={t.done?`Mark ${t.title} incomplete`:`Complete ${t.title}`} className={classnames('gini-task-checkbox',t.done&&'is-done')} onClick={()=>update(d=>({...d,tasks:d.tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x)}))}>{t.done?<Check size={14}/>:null}</button><div className="gini-task-detail"><strong className={t.done?'is-done':''}>{t.title}</strong><small>{dateLabel(t.due)} · {t.priority} priority</small></div><IconButton icon={Pencil} label={`Edit ${t.title}`} onClick={()=>setEdit({...t})}/><IconButton icon={Trash2} label={`Delete ${t.title}`} onClick={()=>update(d=>({...d,tasks:d.tasks.filter(x=>x.id!==t.id)}))}/></div>)}</GlassCard>;
 }):<GlassCard><EmptyState icon={CheckCircle2} title="Nothing here" description="Your tasks will appear here when you add them."/></GlassCard>}</div>{edit&&<div className="gini-modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setEdit(null);}}><GlassCard className="gini-edit-dialog"><form className="gini-form" onSubmit={e=>{e.preventDefault();if(!edit.title.trim())return;update(d=>({...d,tasks:d.tasks.map(x=>x.id===edit.id?{...edit,title:edit.title.trim()}:x)}));setEdit(null);}}><div className="gini-form-title">Edit task <IconButton icon={X} label="Close" onClick={()=>setEdit(null)}/></div><label>Task name<input value={edit.title} maxLength={180} required onChange={e=>setEdit({...edit,title:e.target.value})}/></label><div className="gini-two-fields"><label>Project<select value={edit.projectId} onChange={e=>setEdit({...edit,projectId:e.target.value})}><option value="">No project</option>{data.projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><label>Due date<input type="date" value={edit.due} onChange={e=>setEdit({...edit,due:e.target.value})}/></label><label>Priority<select value={edit.priority} onChange={e=>setEdit({...edit,priority:e.target.value as Task['priority']})}><option>High</option><option>Medium</option><option>Low</option></select></label></div><button className="gini-primary-button" type="submit">Save changes</button></form></GlassCard></div>}</div>;
}
function CalendarView({data,update}:{data:Workspace,update:(fn:(d:Workspace)=>Workspace)=>void}) {
 const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));const [selected,setSelected]=useState(localDay());const [title,setTitle]=useState('');const [time,setTime]=useState('09:00');const [type,setType]=useState<CalendarEvent['type']>('Focus');
 const first=month.getDay(),days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();const dates=[...Array(first).fill(null),...Array.from({length:days},(_,i)=>i+1)];const selectedEvents=data.events.filter(e=>e.date===selected).sort((a,b)=>a.time.localeCompare(b.time));
 return <div className="gini-view"><SectionHeading eyebrow="" title="Master Calendar" subtitle="Schedule events and view upcoming task deadlines." action={<span className="gini-date-badge"><Clock3 size={15}/> {readableDate(selected)}</span>}/><div className="gini-calendar-grid"><GlassCard className="gini-calendar-card"><div className="gini-calendar-toolbar"><h3>{monthLabel(month)}</h3><div className="gini-calendar-toolbar-actions"><button className="gini-secondary-button" onClick={()=>{const n=new Date();setMonth(new Date(n.getFullYear(),n.getMonth(),1));setSelected(localDay());}}>Today</button><IconButton icon={ChevronLeft} label="Previous month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}/><IconButton icon={ChevronRight} label="Next month" onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}/></div></div><div className="gini-calendar-month">{WEEK.map(d=><span className="gini-calendar-weekday" key={d}>{d}</span>)}{dates.map((day,i)=>day===null?<span key={`pad-${i}`}/>:<button key={day} className={classnames('gini-calendar-day',localDay(new Date(month.getFullYear(),month.getMonth(),day))===selected&&'selected',localDay(new Date(month.getFullYear(),month.getMonth(),day))===localDay()&&'today')} onClick={()=>setSelected(localDay(new Date(month.getFullYear(),month.getMonth(),day)))}><span>{day}</span>{data.events.filter(e=>e.date===localDay(new Date(month.getFullYear(),month.getMonth(),day))).slice(0,2).map(e=><span className="gini-calendar-event-chip" key={e.id}><b>{e.time}</b> {e.title}</span>)}</button>)}</div></GlassCard><GlassCard className="gini-calendar-side"><span className="gini-eyebrow">SELECTED DAY</span><h3>{readableDate(selected)}</h3><div className="gini-calendar-events">{selectedEvents.length?selectedEvents.map(e=><div key={e.id} className="gini-event-row"><div className={`gini-event-marker gini-event-${e.type.toLowerCase()}`}/><div><strong>{e.title}</strong><p>{e.time} · {e.type}</p></div><IconButton icon={Trash2} label={`Delete ${e.title}`} onClick={()=>update(d=>({...d,events:d.events.filter(x=>x.id!==e.id)}))}/></div>):<p className="gini-soft-message">A beautiful blank page. Add something below.</p>}</div><form className="gini-form gini-inline-form" onSubmit={e=>{e.preventDefault();if(!title.trim())return;update(d=>({...d,isDemo:false,events:[...d.events,{id:uid(),title:title.trim(),date:selected,time,type}]}));setTitle('');}}><h4>New event</h4><label>Event name<input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Add an event..." maxLength={140}/></label><div className="gini-two-fields"><label>Time<input type="time" value={time} onChange={e=>setTime(e.target.value)} required/></label><label>Type<select value={type} onChange={e=>setType(e.target.value as CalendarEvent['type'])}><option>Focus</option><option>Meeting</option><option>Personal</option></select></label></div><button type="submit" className="gini-primary-button gini-full"><Plus size={16}/> Add event</button></form></GlassCard></div></div>;
}
function ExpensesView({data,update}:{data:Workspace,update:(fn:(d:Workspace)=>Workspace)=>void}) {
 const [title,setTitle]=useState(''); const [amount,setAmount]=useState('');const [date,setDate]=useState(localDay());const [category,setCategory]=useState('Software');const [type,setType]=useState<Expense['type']>('Expense');const [adding,setAdding]=useState(false);
 const month=localDay().slice(0,7);const items=data.expenses.filter(x=>x.date.startsWith(month));const income=items.filter(x=>x.type==='Income').reduce((s,x)=>s+x.amount,0),out=items.filter(x=>x.type==='Expense').reduce((s,x)=>s+x.amount,0);const categories=Object.entries(items.filter(x=>x.type==='Expense').reduce<Record<string,number>>((a,x)=>({...a,[x.category]:(a[x.category]||0)+x.amount}),{})).sort((a,b)=>b[1]-a[1]);
 return <div className="gini-view"><SectionHeading eyebrow="MONEY, MADE CLEAR" title="Your finances" subtitle="Know where it goes. Make intentional choices." action={<button className="gini-primary-button" onClick={()=>setAdding(!adding)}><Plus size={17}/> Add transaction</button>}/><GlassCard className="gini-finance-hero"><div><span className="gini-finance-live"><Sparkles size={13}/> PERSONAL FINANCE · LOCAL LEDGER</span><h2>GiNi Finance Center</h2><p>Clear financial insights from your transactions saved on this device.</p></div><div className="gini-finance-balance"><small>NET LOGGED ACTIVITY</small><strong>{money(income-out)}</strong></div><div className="gini-finance-sections"><span><Wallet size={17}/><b>Income</b><small>{money(income)}</small></span><span><CreditCard size={17}/><b>Expenses</b><small>{money(out)}</small></span><span><BookOpen size={17}/><b>Transactions</b><small>{data.expenses.length} records</small></span><span><TrendingUp size={17}/><b>Categories</b><small>{categories.length} this month</small></span></div></GlassCard><div className="gini-money-summary"><GlassCard className="gini-money-stat"><span><ArrowDownRight size={18}/> Income this month</span><strong>{money(income)}</strong><small>From your logged transactions</small></GlassCard><GlassCard className="gini-money-stat"><span><ArrowUpRight size={18}/> Expenses this month</span><strong>{money(out)}</strong><small>Track expenses as they happen</small></GlassCard><GlassCard className="gini-money-stat"><span><Wallet size={18}/> Net balance</span><strong>{money(income-out)}</strong><small>Income minus expenses logged</small></GlassCard></div>{adding&&<GlassCard className="gini-form-card"><form className="gini-form" onSubmit={e=>{e.preventDefault();const val=Number(amount);if(!title.trim()||!Number.isFinite(val)||val<=0)return;update(d=>({...d,isDemo:false,expenses:[{id:uid(),title:title.trim(),amount:val,date,category,type},...d.expenses]}));setTitle('');setAmount('');setAdding(false);}}><div className="gini-form-title">Add transaction <IconButton icon={X} label="Close" onClick={()=>setAdding(false)}/></div><div className="gini-two-fields"><label>Description<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={150} required placeholder="What was this for?"/></label><label>Amount (₹)<input type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} required placeholder="0"/></label><label>Category<input value={category} onChange={e=>setCategory(e.target.value)} required maxLength={60}/></label><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><label>Transaction type<select value={type} onChange={e=>setType(e.target.value as Expense['type'])}><option>Expense</option><option>Income</option></select></label></div><button type="submit" className="gini-primary-button">Save transaction</button></form></GlassCard>}
 <div className="gini-main-grid"><GlassCard className="gini-transaction-card"><div className="gini-card-title"><div><span className="gini-eyebrow">ACTIVITY</span><h3>Recent transactions</h3></div></div>{data.expenses.length?[...data.expenses].sort((a,b)=>b.date.localeCompare(a.date)).map(x=><div key={x.id} className="gini-transaction-row"><span className={classnames('gini-transaction-icon',x.type==='Income'?'positive':'negative')}>{x.type==='Income'?<ArrowDownRight size={18}/>:<CreditCard size={18}/>}</span><div><strong>{x.title}</strong><small>{x.category} · {dateLabel(x.date)}</small></div><span className={x.type==='Income'?'gini-positive':''}>{x.type==='Income'?'+':'−'}{money(x.amount)}</span><IconButton icon={Trash2} label={`Delete ${x.title}`} onClick={()=>update(d=>({...d,expenses:d.expenses.filter(i=>i.id!==x.id)}))}/></div>):<EmptyState icon={Wallet} title="No transactions" description="Start tracking spending to see trends."/>}</GlassCard><GlassCard className="gini-category-card"><span className="gini-eyebrow">THIS MONTH</span><h3>Expense breakdown</h3>{categories.length?categories.map(([cat,val])=><div className="gini-category-item" key={cat}><div><span>{cat}</span><strong>{money(val)}</strong></div><div className="gini-meter-track"><span style={{width:`${out ? val/out*100:0}%`}}/></div></div>):<EmptyState icon={TrendingUp} title="No spending yet" description="Expense categories appear here."/>}<p className="gini-disclaimer">Only your manually logged transactions are included.</p></GlassCard></div></div>;
}
function HabitsView({data,update}:{data:Workspace,update:(fn:(d:Workspace)=>Workspace)=>void}) {
 const [title,setTitle]=useState('');const today=localDay();const days=Array.from({length:7},(_,i)=>dayOffset(i-6));const done=data.habits.filter(h=>h.completions.includes(today)).length;
 const weekly=data.habits.length?Math.round(data.habits.reduce((total,h)=>total+days.filter(d=>h.completions.includes(d)).length,0)/(data.habits.length*7)*100):0;
 const last30=Array.from({length:30},(_,i)=>dayOffset(i-29));
 const monthly=data.habits.length?Math.round(data.habits.reduce((total,h)=>total+last30.filter(d=>h.completions.includes(d)).length,0)/(data.habits.length*30)*100):0;
 return <div className="gini-view"><SectionHeading eyebrow="" title="Habit Analytics" subtitle="Your daily routines and consistency tracking." action={<span className="gini-count-pill"><Flame size={16}/> {done}/{data.habits.length} today</span>}/><div className="gini-habit-metrics"><GlassCard className="gini-habit-metric"><ProgressRing value={data.habits.length?done/data.habits.length*100:0} label="Daily progress" size={89}/><strong>{data.habits.length?Math.round(done/data.habits.length*100):0}%</strong><span>DAILY PROGRESS</span><small>{done} of {data.habits.length} today</small></GlassCard><GlassCard className="gini-habit-metric"><ProgressRing value={weekly} label="Weekly average" size={89}/><strong className="gini-blue">{weekly}%</strong><span>WEEKLY AVERAGE</span><small>Last 7 days</small></GlassCard><GlassCard className="gini-habit-metric"><ProgressRing value={monthly} label="Monthly consistency" size={89}/><strong>{monthly}%</strong><span>MONTHLY CONSISTENCY</span><small>Last 30 days</small></GlassCard></div><GlassCard className="gini-form-card"><form onSubmit={e=>{e.preventDefault();if(!title.trim())return;update(d=>({...d,isDemo:false,habits:[...d.habits,{id:uid(),title:title.trim(),frequency:'Daily',completions:[]}]}));setTitle('');}} className="gini-quick-add-form"><div className="gini-input-grow"><Plus size={18}/><input placeholder="A habit to build..." aria-label="New habit" value={title} onChange={e=>setTitle(e.target.value)} required maxLength={120}/></div><button type="submit" className="gini-primary-button">Create habit</button></form></GlassCard><GlassCard className="gini-habit-board"><div className="gini-habit-board-head"><h3>Last 7 days</h3><span>Tap any circle to check in</span></div><div className="gini-habit-day-heading"><span>YOUR HABITS</span>{days.map(d=><span key={d}>{new Date(`${d}T12:00:00`).toLocaleDateString('en-IN',{weekday:'short'})}<small>{Number(d.slice(-2))}</small></span>)}<span/></div>{data.habits.length?data.habits.map(h=><div className="gini-habit-row" key={h.id}><strong>{h.title}</strong>{days.map(d=><button key={d} className={classnames('gini-habit-check',h.completions.includes(d)&&'checked')} aria-label={`${h.completions.includes(d)?'Uncheck':'Check'} ${h.title} for ${readableDate(d)}`} onClick={()=>update(w=>({...w,habits:w.habits.map(x=>x.id===h.id?{...x,completions:x.completions.includes(d)?x.completions.filter(y=>y!==d):[...x.completions,d]}:x)}))}>{h.completions.includes(d)?<Check size={14}/>:null}</button>)}<IconButton icon={Trash2} label={`Remove ${h.title}`} onClick={()=>update(d=>({...d,habits:d.habits.filter(x=>x.id!==h.id)}))}/></div>):<EmptyState icon={Flame} title="Start a new streak" description="Your habits will live here."/>}</GlassCard></div>;
}
function NotesView({data,update}:{data:Workspace,update:(fn:(d:Workspace)=>Workspace)=>void}) {
 const [active,setActive]=useState<string|null>(null);const [draft,setDraft]=useState<Note|null>(null);
 const open=(n:Note)=>{setActive(n.id);setDraft({...n});};
 const create=()=>{const n={id:uid(),title:'Untitled note',content:'',updatedAt:new Date().toISOString(),color:'violet'};setActive(n.id);setDraft(n);};
 const save=()=>{if(!draft)return;const next={...draft,title:draft.title.trim()||'Untitled note',updatedAt:new Date().toISOString()};update(d=>({...d,isDemo:false,notes:[next,...d.notes.filter(n=>n.id!==next.id)]}));setActive(null);setDraft(null);};
 if(active && draft) return <div className="gini-view"><div className="gini-note-edit-top"><button className="gini-secondary-button" onClick={()=>{setActive(null);setDraft(null);}}><ChevronLeft size={16}/> Back</button><span className="gini-eyebrow">WRITING SPACE</span><button className="gini-primary-button" onClick={save}><Check size={17}/> Save note</button></div><GlassCard className="gini-note-editor"><input aria-label="Note title" className="gini-note-title-input" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} maxLength={150} placeholder="Note title"/><textarea aria-label="Note content" value={draft.content} onChange={e=>setDraft({...draft,content:e.target.value})} placeholder="Let the ideas flow..."/><p className="gini-disclaimer">Changes are saved locally when you press Save note.</p></GlassCard></div>;
 return <div className="gini-view"><SectionHeading eyebrow="" title="Notes" subtitle="Capture your ideas and journals." action={<button className="gini-primary-button" onClick={create}><Plus size={17}/> New note</button>}/><div className="gini-note-grid">{[...data.notes].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(n=><GlassCard key={n.id} className={`gini-note-card tone-${n.color}`}><button className="gini-note-open" onClick={()=>open(n)}><span className="gini-note-top"><BookOpen size={19}/><ArrowUpRight size={16}/></span><h3>{n.title}</h3><p>{n.content||'An empty canvas is full of possibility.'}</p></button><div className="gini-note-footer"><span>{new Date(n.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span><IconButton icon={Trash2} label={`Delete ${n.title}`} onClick={()=>{if(window.confirm(`Delete “${n.title}”?`))update(d=>({...d,notes:d.notes.filter(x=>x.id!==n.id)}));}}/></div></GlassCard>)}</div>{!data.notes.length&&<GlassCard><EmptyState icon={BookOpen} title="A place for your ideas" description="Create a note and write your first thought."/></GlassCard>}</div>;
}

type SearchResult = {id:string; title:string; type:Module; subtitle:string};
function SearchPalette({data,onClose,onNavigate,query,setQuery}:{data:Workspace,onClose:()=>void,onNavigate:(m:Module)=>void,query:string,setQuery:(s:string)=>void}) {
 const results:SearchResult[] = useMemo(()=>[
  ...data.projects.map(x=>({id:x.id,title:x.title,type:'Projects' as Module,subtitle:x.description})),
  ...data.tasks.map(x=>({id:x.id,title:x.title,type:'Tasks' as Module,subtitle:data.projects.find(p=>p.id===x.projectId)?.title||'Personal task'})),
  ...data.notes.map(x=>({id:x.id,title:x.title,type:'Notes' as Module,subtitle:x.content})),
 ].filter(x=>`${x.title} ${x.subtitle}`.toLowerCase().includes(query.toLowerCase().trim())).slice(0,12),[data,query]);
 return <div className="gini-search-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div role="dialog" aria-modal="true" aria-label="Search workspace" className="gini-search-dialog gini-glass"><div className="gini-search-head"><Search size={20}/><input autoFocus aria-label="Search projects, tasks and notes" placeholder="Search projects, tasks, notes..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')onClose();if(e.key==='Enter'&&results[0]){onNavigate(results[0].type);onClose();}}}/><button className="gini-search-escape" onClick={onClose}>ESC</button></div><div className="gini-search-body"><span className="gini-eyebrow">{query?`${results.length} MATCHES`:'EXPLORE YOUR WORKSPACE'}</span>{results.length?results.map(r=>{const item=NAV.find(i=>i.name===r.type)!;const Icon=item.icon;return <button key={`${r.type}-${r.id}`} className="gini-search-result" onClick={()=>{onNavigate(r.type);onClose();}}><span className={`gini-module-icon tone-${item.tone}`}><Icon size={17}/></span><span><strong>{r.title}</strong><small>{r.type} · {r.subtitle.slice(0,85)}</small></span><ArrowRight size={16}/></button>;}):<EmptyState icon={Search} title="No matching items" description="Try a project, task or note title."/>}</div><div className="gini-search-foot"><span><kbd>↵</kbd> Open first result</span><span>Available without leaving this page</span></div></div></div>;
}
function Preferences({data,update,replace,onClose}:{data:Workspace,update:(fn:(d:Workspace)=>Workspace)=>void,replace:(d:Workspace)=>void,onClose:()=>void}) {
 const [importError,setImportError]=useState('');const uploadRef=useRef<HTMLInputElement>(null);
 const download=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`gini-os-backup-${localDay()}.json`;link.click();URL.revokeObjectURL(url);};
 const loadFile=async(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;try {const raw=await file.text();const result=validateWorkspace(JSON.parse(raw));if(!window.confirm('Replace your current browser workspace with this backup? Export a backup first if needed.'))return;replace(result);setImportError('');onClose();}catch(err){setImportError(err instanceof Error?err.message:'Could not read the backup.');}finally {e.target.value='';}};
 return <div className="gini-modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div role="dialog" aria-modal="true" aria-label="Workspace preferences" className="gini-preferences gini-glass"><div className="gini-form-title"><div><span className="gini-eyebrow">YOUR SPACE</span><h3>Preferences</h3></div><IconButton icon={X} label="Close settings" onClick={onClose}/></div><p>Personalize the look and protect your workspace data.</p><h4>Appearance</h4><div className="gini-preference-buttons">{([{v:'auto',icon:Clock3,label:'Auto by clock'},{v:'light',icon:Sun,label:'Light'},{v:'dark',icon:Moon,label:'Dark'}] as const).map(t=><button key={t.v} className={data.theme===t.v?'active':''} onClick={()=>update(d=>({...d,theme:t.v}))}><t.icon size={19}/>{t.label}</button>)}</div><p className="gini-help-text">Auto uses your device’s local time: light from 7am–7pm, dark otherwise.</p><h4>Keep your data safe</h4><div className="gini-settings-actions"><button className="gini-secondary-button" onClick={download}><Download size={17}/> Export JSON backup</button><button className="gini-secondary-button" onClick={()=>uploadRef.current?.click()}><Upload size={17}/> Import backup</button><input ref={uploadRef} type="file" accept="application/json,.json" hidden onChange={loadFile}/></div>{importError&&<p className="gini-inline-error" role="alert">{importError}</p>}<p className="gini-help-text">Data stays in this browser. Clearing site data or switching devices removes access unless you have a backup. There is no cloud sync in this edition.</p><h4>Workspace data</h4><div className="gini-settings-actions"><button className="gini-secondary-button" onClick={()=>{if(confirm('Replace this workspace with fresh sample content? Back up your data first.')){replace(demoWorkspace());onClose();}}}>Restore sample workspace</button><button className="gini-danger-button" onClick={()=>{if(confirm('Clear all local projects, tasks, calendar events, expenses, habits and notes? This cannot be undone without a backup.')){replace(emptyWorkspace());onClose();}}}>Start with empty workspace</button></div></div></div>;
}

/** The selection follows the finger continuously; navigation commits only on release. */
function SwipeDock({active,onNavigate}:{active:Module,onNavigate:(module:Module)=>void}) {
 const root=useRef<HTMLElement|null>(null);
 const gesture=useRef<{id:number;index:number}|null>(null);
 const [indicator,setIndicator]=useState<{center:number;width:number}|null>(null);
 const [hovered,setHovered]=useState<Module|null>(null);
 const [dragging,setDragging]=useState(false);
 const activeIndex=Math.max(0,NAV.findIndex(n=>n.name===active));
 const measure=useCallback((clientX?:number)=>{
  const element=root.current;if(!element)return {index:activeIndex,center:0,width:0};
  const rect=element.getBoundingClientRect();const side=6;
  const width=Math.max(1,(rect.width-side*2)/NAV.length);
  const center=Math.min(rect.width-side-width/2,Math.max(side+width/2,clientX===undefined?side+width*(activeIndex+.5):clientX-rect.left));
  const index=Math.min(NAV.length-1,Math.max(0,Math.round((center-side-width/2)/width)));
  return {index,center,width};
 },[activeIndex]);
 useEffect(()=>{
  if(gesture.current)return;
  const refresh=()=>setIndicator(measure());
  refresh();const node=root.current;
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(refresh):null;
  if(node)observer?.observe(node);
  window.addEventListener('resize',refresh);
  return ()=>{observer?.disconnect();window.removeEventListener('resize',refresh);};
 },[measure]);
 const track=(e:React.PointerEvent<HTMLElement>)=>{
  if(!gesture.current||gesture.current.id!==e.pointerId)return;
  const next=measure(e.clientX);gesture.current.index=next.index;
  setIndicator({center:next.center,width:next.width});setHovered(NAV[next.index].name);
 };
 const release=(e:React.PointerEvent<HTMLElement>,cancel=false)=>{
  if(!gesture.current||gesture.current.id!==e.pointerId)return;
  const next=cancel?null:measure(e.clientX);
  const selected=next?NAV[next.index].name:active;
  gesture.current=null;setDragging(false);setHovered(null);
  if(next)setIndicator({center:6+next.width*(next.index+.5),width:next.width});
  else setIndicator(measure());
  if(!cancel)onNavigate(selected);
  if(root.current?.hasPointerCapture(e.pointerId))root.current.releasePointerCapture(e.pointerId);
 };
 return <nav ref={root} className={classnames('gini-mobile-dock gini-glass',dragging&&'is-dragging')} aria-label="Swipe to select a module, release to open" onPointerDown={e=>{
   if(e.button!==0)return;
   const next=measure(e.clientX);
   gesture.current={id:e.pointerId,index:next.index};setDragging(true);setHovered(NAV[next.index].name);
   setIndicator({center:next.center,width:next.width});e.currentTarget.setPointerCapture(e.pointerId);
  }} onPointerMove={track} onPointerUp={e=>release(e)} onPointerCancel={e=>release(e,true)}>
  <span className="gini-dock-indicator" aria-hidden="true" style={indicator?{left:`${indicator.center}px`,width:`${indicator.width-5}px`}:{left:`${(activeIndex+.5)/NAV.length*100}%`,width:`calc((100% - 12px) / ${NAV.length} - 5px)`}}/>
  {NAV.map(n=><button type="button" key={n.name} aria-label={n.name} aria-current={active===n.name?'page':undefined} className={classnames('gini-dock-item',(hovered||active)===n.name&&'active')} onClick={e=>{if(e.detail===0)onNavigate(n.name);}}><n.icon size={19}/><small>{n.name}</small></button>)}
 </nav>;
}

export default function LiquidOS() {
 const {data,ready,error,update,retry,replace}=useLocalWorkspace();
 const [active,setActive]=useState<Module>('Overview');const [searchOpen,setSearchOpen]=useState(false);const [searchQuery,setSearchQuery]=useState('');const [settingsOpen,setSettingsOpen]=useState(false);const [sidebarOpen,setSidebarOpen]=useState(false);const [clockTick,setClockTick]=useState(0);const [online,setOnline]=useState(true); const contentRef=useRef<HTMLElement>(null);
 useEffect(()=>{setOnline(navigator.onLine);const id=window.setInterval(()=>setClockTick(t=>t+1),60_000);const status=()=>setOnline(navigator.onLine);window.addEventListener('online',status);window.addEventListener('offline',status);return ()=>{window.clearInterval(id);window.removeEventListener('online',status);window.removeEventListener('offline',status);};},[]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(v=>!v);}if(e.key==='Escape'){setSearchOpen(false);setSettingsOpen(false);setSidebarOpen(false);}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[]);
 const go=(m:Module)=>{setActive(m);setSidebarOpen(false);contentRef.current?.scrollTo({top:0,behavior:'smooth'});};
 const theme=ready?inferTheme(data.theme):'dark';void clockTick;
 const activeMeta=NAV.find(n=>n.name===active)!;
 return <div className="gini-app" data-theme={theme}>
  <div className="gini-ambient gini-ambient-one"/><div className="gini-ambient gini-ambient-two"/><div className="gini-ambient gini-ambient-three"/>
  {sidebarOpen&&<button className="gini-sidebar-scrim" aria-label="Close navigation" onClick={()=>setSidebarOpen(false)}/>}
  <aside className={classnames('gini-sidebar gini-glass',sidebarOpen&&'gini-sidebar-open')}><div className="gini-brand"><span className="gini-brand-mark"><img src="/G-logo.png" alt="" width="37" height="37"/></span><span><strong>GiNi OS</strong><small>YOUR PERSONAL UNIVERSE</small></span><button className="gini-mobile-sidebar-close" aria-label="Close sidebar" onClick={()=>setSidebarOpen(false)}><X size={20}/></button></div><div className="gini-sidebar-label">WORKSPACE</div><nav aria-label="Main navigation" className="gini-navigation">{NAV.map(x=><button key={x.name} className={classnames('gini-nav-link',active===x.name&&'gini-nav-active')} onClick={()=>go(x.name)} aria-current={active===x.name?'page':undefined}><span className="gini-nav-icon"><x.icon size={19}/></span>{x.name}{active===x.name&&<span className="gini-nav-indicator"/>}</button>)}</nav><div className="gini-sidebar-bottom"><div className="gini-sidebar-companion"><div className="gini-companion-stars"><Sparkles size={21}/></div><span>MEET YOUR COMPANION</span><strong>A calmer, clearer day.</strong><p>GiNi finds patterns in your personal workspace, right on your device.</p><button onClick={()=>go('Overview')}>Explore insights <ArrowRight size={15}/></button></div><button className="gini-sidebar-settings" onClick={()=>setSettingsOpen(true)}><Settings2 size={19}/> Preferences <ChevronRight size={16}/></button><div className="gini-profile"><span className="gini-avatar">G</span><div><strong>My workspace</strong><small>{online?'Stored on this device':'Offline · Local changes available'}</small></div><span className="gini-profile-check"><Check size={13}/></span></div></div></aside>
  <div className="gini-main-area"><header className="gini-topbar gini-glass"><button className="gini-global-search gini-search-desktop" onClick={()=>{setSearchOpen(true);setSearchQuery('');}}><Search size={17}/><span>Search anything...</span><kbd>⌘ K</kbd></button><div className="gini-crumb"><button className="gini-mobile-menu" aria-label="Open navigation" onClick={()=>setSidebarOpen(true)}><Menu size={21}/></button><span>Workspace</span><ChevronRight size={15}/><strong>{active}</strong></div><div className="gini-topbar-actions"><button className="gini-global-search gini-search-mobile" onClick={()=>{setSearchOpen(true);setSearchQuery('');}}><Search size={17}/><span>Search everything...</span><kbd>⌘ K</kbd></button><span className={classnames('gini-connection',!online&&'offline')} title={online?'Network available':'Working offline'}>{online?<ShieldCheck size={15}/>:<CloudOff size={15}/>}<span>{online?'Local-first':'Offline'}</span></span><button className="gini-theme-toggle" onClick={()=>update(d=>({...d,theme:theme==='dark'?'light':'dark'}))} aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`} title="Toggle appearance">{theme==='dark'?<Sun size={19}/>:<Moon size={19}/>}</button><button className="gini-top-avatar" aria-label="Open preferences" onClick={()=>setSettingsOpen(true)}>G</button></div></header>
   <main className="gini-content" ref={contentRef} id="main-content"><div className="gini-content-inner">{data.isDemo&&<div className="gini-demo-banner"><Lightbulb size={15}/><span>You’re exploring a sample workspace. Everything is editable and saved locally.</span><button onClick={()=>setSettingsOpen(true)}>Manage data <ArrowRight size={13}/></button></div>}
    {!ready?<GlassCard className="gini-loading"><span className="gini-loader"/> Preparing your workspace...</GlassCard>:error?.kind==='read'?<ModuleError read detail={error.detail} retry={retry}/>:<><div key={active} className="gini-view-transition"><GlassErrorBoundary name={active} key={active}>
     {active==='Overview'&&<Overview data={data} navigate={go} update={update}/>}
     {active==='Projects'&&<ProjectsView data={data} update={update}/>}
     {active==='Tasks'&&<TasksView data={data} update={update}/>}
     {active==='Calendar'&&<CalendarView data={data} update={update}/>}
     {active==='Expenses'&&<ExpensesView data={data} update={update}/>}
     {active==='Habits'&&<HabitsView data={data} update={update}/>}
     {active==='Notes'&&<NotesView data={data} update={update}/>}
    </GlassErrorBoundary></div>{error?.kind==='save'&&<ModuleError detail={error.detail} retry={retry} read={false}/>}</>}
    <footer className="gini-footer"><span><Sparkles size={15}/> GiNi OS · Your space to grow</span><span>{online?'Everything here is saved in this browser':'Working offline — your changes can still be saved on this device'}</span></footer></div></main>
  </div><SwipeDock active={active} onNavigate={go}/>
  {searchOpen&&<SearchPalette data={data} onClose={()=>setSearchOpen(false)} onNavigate={go} query={searchQuery} setQuery={setSearchQuery}/>}
  {settingsOpen&&<Preferences data={data} update={update} replace={replace} onClose={()=>setSettingsOpen(false)}/>}
 </div>;
}

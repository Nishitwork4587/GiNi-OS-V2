"use client";
import React, { useState } from 'react';
import { CheckCircle2, Circle, Bot, Cpu, ShoppingCart, Sparkles, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

const INITIAL_PROJECTS = [
  {
    id: 'gini-ai', title: 'GiNi Ai', icon: Bot, colorFrom: 'from-blue-600', colorTo: 'to-blue-400', textColor: 'text-blue-400', glow: 'bg-blue-500/10',
    phases: [
      { name: 'Phase 1: Research & Blueprint', timeline: 'Nov 1 - Nov 10', milestone: 10, isOpen: true, tasks: [{ text: 'Define the core purpose and target audience for GiNi Ai.', done: false }, { text: 'Finalize the technology stack (e.g., Python, Node.js, specific AI APIs).', done: false }, { text: 'Sketch out the user interface (UI) and user flow.', done: false }] },
      { name: 'Phase 2: Setup & Foundation', timeline: 'Nov 11 - Nov 25', milestone: 30, isOpen: true, tasks: [{ text: 'Set up the code repository (GitHub/GitLab).', done: false }, { text: 'Connect and authenticate the chosen AI language model API.', done: false }, { text: 'Build a basic, unstyled terminal/web interface to test API responses.', done: false }] },
      { name: 'Phase 3: Core Development', timeline: 'Nov 26 - Dec 10', milestone: 60, isOpen: false, tasks: [{ text: 'Build conversational memory so the AI remembers context.', done: false }, { text: 'Develop the front-end UI based on your initial sketches.', done: false }, { text: 'Implement user authentication and a database for chat histories.', done: false }] },
      { name: 'Phase 4: Polish, Design & Bug Fixing', timeline: 'Dec 11 - Dec 22', milestone: 90, isOpen: false, tasks: [{ text: 'Perform edge-case testing to ensure the AI doesn\'t break.', done: false }, { text: 'Refine the UI/UX design (add loading states, animations).', done: false }, { text: 'Ensure full mobile responsiveness.', done: false }] },
      { name: 'Phase 5: Final Review & Launch', timeline: 'Dec 23 - Dec 31', milestone: 100, isOpen: false, tasks: [{ text: 'Deploy the application to a live server (Vercel, AWS, etc.).', done: false }, { text: 'Connect the custom domain name.', done: false }, { text: 'Conduct final live testing and officially launch.', done: false }] }
    ]
  },
  {
    id: 'jarvis-ai', title: 'Jarvis Ai', icon: Cpu, colorFrom: 'from-purple-600', colorTo: 'to-purple-400', textColor: 'text-purple-400', glow: 'bg-purple-500/10',
    phases: [
      { name: 'Phase 1: Research & Blueprint', timeline: 'Nov 1 - Nov 15', milestone: 10, isOpen: true, tasks: [{ text: 'Identify the exact automations Jarvis will handle (emails, scraping, smart home).', done: false }, { text: 'Choose the frameworks (e.g., LangChain, local vs. cloud models).', done: false }, { text: 'List all required third-party API keys (Gmail, Notion, Slack).', done: false }] },
      { name: 'Phase 2: Setup & Foundation', timeline: 'Nov 16 - Nov 30', milestone: 30, isOpen: false, tasks: [{ text: 'Set up the local server or primary cloud environment.', done: false }, { text: 'Authenticate the first major tool (e.g., Google Workspace API).', done: false }, { text: 'Write the base script to receive and log a text/voice command.', done: false }] },
      { name: 'Phase 3: Core Development', timeline: 'Dec 1 - Dec 15', milestone: 60, isOpen: false, tasks: [{ text: 'Build the core routing logic (understanding intent and triggering actions).', done: false }, { text: 'Integrate the remaining third-party tools.', done: false }, { text: 'Set up background cron jobs for autonomous tasks.', done: false }] },
      { name: 'Phase 4: Polish, Design & Bug Fixing', timeline: 'Dec 16 - Dec 25', milestone: 90, isOpen: false, tasks: [{ text: 'Test all multi-step workflows for accuracy.', done: false }, { text: 'Create a simple monitoring dashboard or terminal log view.', done: false }, { text: 'Refine the AI system prompts for better instruction following.', done: false }] },
      { name: 'Phase 5: Final Review & Launch', timeline: 'Dec 26 - Dec 31', milestone: 100, isOpen: false, tasks: [{ text: 'Transition Jarvis to run 24/7 in the background.', done: false }, { text: 'Set up error alerting (e.g., a Telegram message if a script fails).', done: false }, { text: 'Finalize integrations and activate full automation.', done: false }] }
    ]
  },
  {
    id: 'shopify-theme', title: 'Shopify Theme', icon: ShoppingCart, colorFrom: 'from-emerald-600', colorTo: 'to-emerald-400', textColor: 'text-emerald-400', glow: 'bg-emerald-500/10',
    phases: [
      { name: 'Phase 1: Research & Blueprint', timeline: 'Nov 1 - Nov 8', milestone: 10, isOpen: true, tasks: [{ text: 'Define brand identity (colors, typography, logo).', done: false }, { text: 'Wireframe the Homepage, Product, and Collection layouts.', done: false }, { text: 'Determine required custom features (swatches, timers, size charts).', done: false }] },
      { name: 'Phase 2: Setup & Foundation', timeline: 'Nov 9 - Nov 20', milestone: 30, isOpen: false, tasks: [{ text: 'Create the development store in the Shopify Partner dashboard.', done: false }, { text: 'Initialize the theme code (using Shopify CLI/Dawn as a base).', done: false }, { text: 'Upload placeholder products and imagery for testing.', done: false }] },
      { name: 'Phase 3: Core Development', timeline: 'Nov 21 - Dec 5', milestone: 60, isOpen: false, tasks: [{ text: 'Code the Header, Footer, and global navigation.', done: false }, { text: 'Build out the custom Homepage layout and sections.', done: false }, { text: 'Develop the Product Page (galleries, variants, add-to-cart).', done: false }, { text: 'Build Collection pages and the Cart drawer/page.', done: false }] },
      { name: 'Phase 4: Polish, Design & Bug Fixing', timeline: 'Dec 6 - Dec 20', milestone: 90, isOpen: false, tasks: [{ text: 'Perform strict mobile and tablet responsive testing.', done: false }, { text: 'Optimize page load speeds (image compression, code minification).', done: false }, { text: 'Integrate essential Shopify apps.', done: false }, { text: 'Run test checkouts to verify the user journey.', done: false }] },
      { name: 'Phase 5: Final Review & Launch', timeline: 'Dec 21 - Dec 31', milestone: 100, isOpen: false, tasks: [{ text: 'Transfer the finished theme to the live production store.', done: false }, { text: 'Connect the live custom domain and configure DNS.', done: false }, { text: 'Remove the storefront password and launch to the public.', done: false }] }
    ]
  }
];

export default function ProjectsModule({ searchQuery = "" }: { searchQuery?: string }) {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const toggleTask = (projectId: string, phIndex: number, tIndex: number) => {
    const updated = [...projects];
    const pIndex = updated.findIndex(p => p.id === projectId);
    if (pIndex === -1) return;
    updated[pIndex].phases[phIndex].tasks[tIndex].done = !updated[pIndex].phases[phIndex].tasks[tIndex].done;
    setProjects(updated);
  };

  const togglePhaseDropdown = (projectId: string, phIndex: number) => {
    const updated = [...projects];
    const pIndex = updated.findIndex(p => p.id === projectId);
    if (pIndex === -1) return;
    updated[pIndex].phases[phIndex].isOpen = !updated[pIndex].phases[phIndex].isOpen;
    setProjects(updated);
  };

  const getProgress = (project: any) => {
    let totalTasks = 0;
    let completedTasks = 0;
    project.phases.forEach((ph: any) => {
      ph.tasks.forEach((t: any) => {
        totalTasks++;
        if (t.done) completedTasks++;
      });
    });
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
            Master Project Timeline <Sparkles className="text-emerald-400" size={20} />
          </h1>
          <p className="text-sm text-neutral-400 mt-1">Progress Tracker</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {filteredProjects.map((project) => {
          const progress = getProgress(project);
          return (
            <div key={project.id} className="bg-[#131315] rounded-3xl border border-white/5 overflow-hidden shadow-xl relative">
              <div className="relative p-6 border-b border-white/5 overflow-hidden">
                <div className={`absolute -top-10 -right-10 w-48 h-48 blur-3xl rounded-full pointer-events-none ${project.glow}`} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md shadow-inner ${project.textColor}`}>
                      <project.icon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-neutral-100 tracking-tight">{project.title}</h2>
                      <p className="text-sm text-neutral-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={14} /> Path to 100% Completion
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${project.textColor}`}>Overall Progress</span>
                      <span className="text-sm font-bold text-neutral-100">{progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                      <div className={`h-full bg-gradient-to-r ${project.colorFrom} ${project.colorTo} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="relative border-l-2 border-white/5 ml-3 space-y-6">
                  {project.phases.map((phase, phIndex) => {
                    const phaseTotal = phase.tasks.length;
                    const phaseDone = phase.tasks.filter(t => t.done).length;
                    const isPhaseComplete = phaseTotal === phaseDone;

                    return (
                      <div key={phIndex} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-[#131315] ${isPhaseComplete ? `bg-gradient-to-br ${project.colorFrom} ${project.colorTo}` : 'bg-neutral-700'}`} />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer group" onClick={() => togglePhaseDropdown(project.id, phIndex)}>
                          <div className="flex items-center gap-2">
                            {phase.isOpen ? <ChevronDown size={18} className="text-neutral-500" /> : <ChevronRight size={18} className="text-neutral-500" />}
                            <h3 className={`font-semibold transition-colors ${isPhaseComplete ? 'text-neutral-400 line-through' : 'text-neutral-200'}`}>{phase.name}</h3>
                          </div>
                          <div className="flex items-center gap-3 pl-7 sm:pl-0">
                            <span className="text-xs text-neutral-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">{phase.timeline}</span>
                            <span className={`text-xs font-bold ${isPhaseComplete ? project.textColor : 'text-neutral-500'}`}>{phaseDone}/{phaseTotal}</span>
                          </div>
                        </div>

                        {phase.isOpen && (
                          <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 fade-in duration-300">
                            {phase.tasks.map((task, tIndex) => (
                              <div key={tIndex} onClick={() => toggleTask(project.id, phIndex, tIndex)} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer border ${task.done ? 'bg-white/[0.02] border-white/5' : 'bg-black/20 border-transparent hover:bg-white/[0.03] hover:border-white/10'}`}>
                                <div className={`flex-shrink-0 mt-0.5 transition-all duration-300 ${task.done ? project.textColor + ' drop-shadow-md scale-110' : 'text-neutral-600'}`}>
                                  {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                </div>
                                <span className={`text-sm transition-colors duration-300 ${task.done ? 'text-neutral-500 line-through' : 'text-neutral-300'}`}>{task.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

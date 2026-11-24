"use client";
import React from 'react';
import { LayoutDashboard, CheckCircle2, Calendar as CalendarIcon, BookOpen, Activity, CreditCard } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Tasks', icon: CheckCircle2 },
    { name: 'Calendar', icon: CalendarIcon },
    { name: 'Expenses', icon: CreditCard },
    { name: 'Habits', icon: Activity },
    { name: 'Notes', icon: BookOpen },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.05] bg-[#050505]/60 backdrop-blur-2xl hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
      <div className="h-16 flex items-center px-6 border-b border-white/[0.05]">
        <img src="/G-logo.png" alt="GiNi OS Logo" className="w-8 h-8 mr-3 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.4)]" />
        <span className="font-semibold text-sm tracking-widest text-neutral-100 uppercase">GiNi OS</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="text-[10px] font-semibold text-neutral-600 tracking-wider uppercase mb-4 px-2">Menu</p>
        
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 relative overflow-hidden group ${
                isActive ? 'text-neutral-100 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {/* Active Tab Glass Background */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/5 backdrop-blur-md border border-white/[0.08] rounded-xl -z-10" />
              )}
              {/* Hover effect for inactive tabs */}
              {!isActive && (
                <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10" />
              )}
              
              <item.icon size={18} className={`${isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'group-hover:scale-110 transition-transform'}`} />
              {item.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

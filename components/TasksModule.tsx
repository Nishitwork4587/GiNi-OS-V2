"use client";

import React, { useState, useEffect } from 'react';
import { fetchTasks, toggleTaskInDb, addTaskToDb, deleteTaskFromDb, updateTaskInDb } from '../app/actions';
import { Plus, CheckCircle2, Circle, Trash2, Pencil, X, Check, Folder } from 'lucide-react';

const CATEGORIES = ['GiNi AI', 'Jarvis AI', 'Shopify Theme', 'YouTube', 'Personal'];

export default function TasksModule({ searchQuery = "" }: { searchQuery?: string }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add Task States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState(CATEGORIES[0]);

  // Edit Task States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const dbTasks = await fetchTasks();
    setTasks(dbTasks || []);
    setIsLoading(false);
  };

  const handleToggleTask = async (id: number, currentStatus: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    await toggleTaskInDb(id, currentStatus);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    // Optimistic fast UI update
    const tempId = Date.now();
    const newTask = { id: tempId, title: newTaskTitle, project: newTaskCategory, done: false };
    setTasks([...tasks, newTask]);
    
    await addTaskToDb(newTaskTitle, newTaskCategory, '', 'medium');
    setNewTaskTitle('');
    loadTasks();
  };

  const handleDeleteTask = async (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter(t => t.id !== id));
      await deleteTaskFromDb(id);
    }
  };

  const startEditing = (task: any) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditCategory(task.project || CATEGORIES[0]);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    
    setTasks(tasks.map(t => t.id === id ? { ...t, title: editTitle, project: editCategory } : t));
    setEditingId(null);
    await updateTaskInDb(id, editTitle, editCategory);
  };

  // 1. Filter out search queries safely
  const filteredTasks = tasks.filter(task => 
    (task.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. Group tasks by your custom categories using the filtered list
  const groupedTasks = CATEGORIES.reduce((acc, category) => {
    const categoryTasks = filteredTasks.filter(t => t.project === category);
    if (categoryTasks.length > 0) {
      acc[category] = categoryTasks.sort((a, b) => (a.done === b.done) ? 0 : a.done ? 1 : -1);
    }
    return acc;
  }, {} as Record<string, any[]>);

  // Catch any tasks that don't match the specific categories above
  const otherTasks = filteredTasks.filter(t => !CATEGORIES.includes(t.project));
  if (otherTasks.length > 0) {
    groupedTasks['Other'] = otherTasks.sort((a, b) => (a.done === b.done) ? 0 : a.done ? 1 : -1);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">Tasks</h1>
          <p className="text-sm text-neutral-400 mt-1">Organize and execute your key projects.</p>
        </div>
      </div>

      {/* Task Creation Bar */}
      <div className="bg-[#131315] border border-white/5 p-2 rounded-2xl shadow-sm focus-within:border-blue-500/50 transition-colors">
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex flex-1 w-full items-center">
            <Plus size={20} className="text-neutral-500 ml-2" />
            <input 
              type="text" 
              placeholder="Add a new task..." 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-transparent border-none text-base text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-0 py-2 pl-3"
            />
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2 pl-2 sm:pl-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
            <select 
              value={newTaskCategory} 
              onChange={(e) => setNewTaskCategory(e.target.value)}
              className="bg-[#09090b] border border-white/10 rounded-lg p-2 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/50"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button 
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Grouped Task List */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-neutral-500 bg-[#131315] rounded-2xl border border-white/5">Loading tasks...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
            <div key={category} className="bg-[#131315] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
              
              {/* Category Header */}
              <div className="bg-[#09090b]/50 px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Folder size={16} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-neutral-200 tracking-wide">{category}</h3>
                <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full ml-2">
                  {categoryTasks.length}
                </span>
              </div>
              
              {/* Tasks in Category */}
              <div className="divide-y divide-white/5">
                {categoryTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
                    
                    {/* Checkbox */}
                    <button 
                      onClick={() => handleToggleTask(task.id, task.done)}
                      className="flex-shrink-0 text-neutral-600 hover:text-emerald-400 transition-colors focus:outline-none"
                    >
                      {task.done ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Circle size={20} />}
                    </button>
                    
                    {/* Task Content or Edit Form */}
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="text" 
                            value={editTitle} 
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 bg-[#09090b] border border-blue-500/50 rounded-md p-1.5 text-sm text-neutral-200 focus:outline-none"
                            autoFocus
                          />
                          <select 
                            value={editCategory} 
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="bg-[#09090b] border border-white/10 rounded-md p-1.5 text-xs text-neutral-300 focus:outline-none"
                          >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                      ) : (
                        <span className={`text-base transition-all duration-300 ${
                          task.done ? 'text-emerald-500/60 italic' : 'text-neutral-200'
                        }`}>
                          {task.title}
                          {task.done && <span className="ml-3 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full not-italic">Done</span>}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons (Edit / Save / Delete) */}
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingId === task.id ? (
                        <>
                          <button onClick={() => setEditingId(null)} className="text-neutral-500 hover:text-neutral-300 p-1">
                            <X size={16} />
                          </button>
                          <button onClick={() => handleSaveEdit(task.id)} className="text-blue-400 hover:text-blue-300 p-1">
                            <Check size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(task)} className="text-neutral-500 hover:text-blue-400 p-1">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)} className="text-neutral-500 hover:text-red-400 p-1">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {!isLoading && Object.keys(groupedTasks).length === 0 && (
            <div className="p-8 text-center text-sm text-neutral-500 bg-[#131315] rounded-2xl border border-white/5">
              {searchQuery ? 'No tasks match your search.' : 'You have no tasks. Add one above!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { fetchNotes, saveNoteToDb, deleteNoteFromDb } from '../app/actions';
import { Plus, BookOpen, Clock, ChevronLeft, Trash2, Save } from 'lucide-react';

export default function NotesModule({ searchQuery = "" }: { searchQuery?: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    const dbNotes = await fetchNotes();
    setNotes(dbNotes || []);
    setIsLoading(false);
  };

  const handleOpenNote = (note: any) => {
    setActiveNote(note);
    setEditTitle(note?.title || '');
    setEditContent(note?.content || '');
  };

  const handleSaveNote = async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    
    await saveNoteToDb(activeNote?.id || null, editTitle, editContent);
    await loadNotes();
    
    setIsSaving(false);
    setActiveNote(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNoteFromDb(id);
      if (activeNote?.id === id) setActiveNote(null);
      loadNotes();
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Safe search filtering across both title and content
  const filteredNotes = notes.filter(note => 
    (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeNote !== null) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
        <div className="flex items-center justify-between bg-[#131315] border border-white/5 p-3 rounded-2xl">
          <button 
            onClick={() => setActiveNote(null)}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors px-2"
          >
            <ChevronLeft size={18} /> Back
          </button>
          
          <div className="flex items-center gap-2">
            {activeNote.id && (
              <button 
                onClick={() => handleDelete(activeNote.id)}
                className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button 
              onClick={handleSaveNote}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#131315] border border-white/5 rounded-2xl p-6 flex flex-col min-h-[60vh]">
          <input 
            type="text" 
            placeholder="Note Title..."
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-transparent text-2xl font-semibold text-neutral-100 placeholder-neutral-600 border-none focus:outline-none focus:ring-0 mb-4"
            autoFocus
          />
          <textarea
            placeholder="Start writing..."
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 w-full bg-transparent text-neutral-300 placeholder-neutral-600 border-none focus:outline-none focus:ring-0 resize-none leading-relaxed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">Notes</h1>
          <p className="text-sm text-neutral-400 mt-1">Capture your ideas and journals.</p>
        </div>
        <button 
          onClick={() => handleOpenNote({})} 
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8 text-neutral-500 text-sm">Loading your notes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div 
              key={note.id} 
              onClick={() => handleOpenNote(note)}
              className="bg-[#131315] border border-white/5 hover:border-white/10 p-5 rounded-2xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col h-48"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="bg-white/5 p-2 rounded-lg text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                  <BookOpen size={18} />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                  className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-400 p-1 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <h3 className="text-base font-medium text-neutral-200 mb-2 truncate group-hover:text-blue-400 transition-colors">
                {note.title}
              </h3>
              
              <p className="text-sm text-neutral-500 line-clamp-3 mb-auto">
                {note.content || 'No content yet...'}
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center text-[11px] text-neutral-500 gap-1.5">
                <Clock size={12} />
                Updated {formatDate(note.updated_at)}
              </div>
            </div>
          ))}

          {!isLoading && filteredNotes.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <BookOpen size={32} className="text-neutral-600 mb-3" />
              <p className="text-neutral-400 font-medium">
                {searchQuery ? 'No notes match your search' : 'No notes yet'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {searchQuery ? 'Try a different search term.' : 'Click "New Note" to capture an idea.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

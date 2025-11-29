import React from 'react';
import { BookOpen, MessageSquare, FileText, ShieldAlert, PlusCircle, Trash2, Library } from 'lucide-react';
import { AppMode, StudyContext } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  studyContext: StudyContext | null;
  setStudyContext: (ctx: StudyContext | null) => void;
  onClearChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentMode, 
  setMode, 
  studyContext, 
  setStudyContext,
  onClearChat
}) => {
  const materialCount = studyContext?.materials.length || 0;

  return (
    <div className="w-64 bg-legal-900 text-legal-100 flex flex-col h-full border-r border-legal-700 shadow-xl z-20">
      <div className="p-6 border-b border-legal-800">
        <div className="flex items-center gap-2 text-highlight mb-1">
          <ShieldAlert size={24} />
          <span className="font-serif font-bold text-lg">CyberLaw Tutor</span>
        </div>
        <p className="text-xs text-legal-400">AI Exam Coach</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setMode(AppMode.CHAT)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentMode === AppMode.CHAT ? 'bg-legal-700 text-white' : 'hover:bg-legal-800 text-legal-300'}`}
        >
          <MessageSquare size={18} />
          <span className="font-medium">Tutor Chat</span>
        </button>

        <button 
          onClick={() => setMode(AppMode.OUTLINE)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentMode === AppMode.OUTLINE ? 'bg-legal-700 text-white' : 'hover:bg-legal-800 text-legal-300'}`}
        >
          <BookOpen size={18} />
          <div className="flex flex-col items-start">
             <span className="font-medium">Knowledge Bank</span>
             <span className="text-[10px] text-legal-400">Upload & Analyze</span>
          </div>
        </button>

        <button 
          onClick={() => setMode(AppMode.EXAM_PREP)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentMode === AppMode.EXAM_PREP ? 'bg-legal-700 text-white' : 'hover:bg-legal-800 text-legal-300'}`}
        >
          <FileText size={18} />
          <span className="font-medium">Exam Practice</span>
        </button>
      </nav>

      <div className="p-4 border-t border-legal-800">
        <h3 className="text-xs font-semibold text-legal-500 uppercase tracking-wider mb-3">Knowledge Bank</h3>
        
        {materialCount > 0 ? (
          <div className="bg-legal-800 rounded p-3 text-sm border border-legal-600">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 text-highlight font-bold text-xs">
                <Library size={12} />
                <span>{materialCount} Items Loaded</span>
              </div>
              <button onClick={() => setStudyContext({ materials: [] })} className="text-legal-400 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-[10px] text-legal-300 italic">
                Includes {studyContext?.materials.filter(m => m.type === 'file').length} files and {studyContext?.materials.filter(m => m.type === 'text').length} notes.
            </p>
          </div>
        ) : (
          <div className="text-xs text-legal-400 italic px-2">
            No materials loaded. Go to "Knowledge Bank" to add exams or notes.
          </div>
        )}

        <button 
          onClick={onClearChat}
          className="mt-6 w-full flex items-center justify-center gap-2 text-xs text-legal-400 hover:text-white py-2 rounded border border-transparent hover:border-legal-700 transition-all"
        >
          <PlusCircle size={14} />
          New Session
        </button>
      </div>
    </div>
  );
};
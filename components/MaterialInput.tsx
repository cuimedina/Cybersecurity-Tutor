import React, { useState, useRef } from 'react';
import { Upload, Book, FileText, CheckCircle, ArrowRight, Music, X, File as FileIcon, Brain, List, Scale, AlertOctagon } from 'lucide-react';
import { StudyContext, StudyMaterial } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { generateKnowledgeBankAnalysis } from '../services/geminiService';

interface MaterialInputProps {
  onSetContext: (ctx: StudyContext) => void;
  currentContext: StudyContext | null;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const MaterialInput: React.FC<MaterialInputProps> = ({ onSetContext, currentContext }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<StudyMaterial['category']>('Exam');
  const [materials, setMaterials] = useState<StudyMaterial[]>(currentContext?.materials || []);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setErrorMessage(null);
    if (files && files.length > 0) {
        Array.from(files).forEach((selectedFile: File) => {
            // Check size (Limit to 10MB to prevent API Payload errors)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setErrorMessage(`File "${selectedFile.name}" is too large (>10MB). Please compress it or split it.`);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result as string;
                const base64Data = base64String.split(',')[1];
                
                const newMaterial: StudyMaterial = {
                    id: generateId(),
                    name: selectedFile.name,
                    type: 'file',
                    content: base64Data,
                    mimeType: selectedFile.type,
                    category: category
                };

                setMaterials(prev => {
                    const next = [...prev, newMaterial];
                    // Auto-update context when adding files
                    onSetContext({ materials: next });
                    return next;
                });
            };
            reader.readAsDataURL(selectedFile);
        });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddText = () => {
      if (!text.trim()) return;
      setErrorMessage(null);
      const newMaterial: StudyMaterial = {
          id: generateId(),
          name: `Text Note - ${new Date().toLocaleTimeString()}`,
          type: 'text',
          content: text,
          category: category
      };
      setMaterials(prev => {
        const next = [...prev, newMaterial];
        onSetContext({ materials: next });
        return next;
    });
      setText('');
  };

  const removeMaterial = (id: string) => {
      setMaterials(prev => {
          const next = prev.filter(m => m.id !== id);
          onSetContext({ materials: next });
          return next;
      });
  };

  const handleAnalyze = async (type: 'OUTLINE' | 'PATTERNS' | 'RULES') => {
    if (materials.length === 0) return;
    
    setIsGenerating(true);
    setGeneratedOutput(null);
    setErrorMessage(null);
    
    // Ensure context is synced
    onSetContext({ materials });
    
    const output = await generateKnowledgeBankAnalysis({ materials }, type);
    
    // Check if output contains our custom error flag from the service
    if (output.startsWith('FAILED:')) {
        setErrorMessage(output.replace('FAILED:', '').trim());
        setGeneratedOutput(null);
    } else {
        setGeneratedOutput(output);
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="flex h-full">
      {/* Input Section */}
      <div className="w-1/2 p-6 border-r border-legal-200 flex flex-col bg-white overflow-y-auto">
        <h2 className="font-serif font-bold text-xl text-legal-900 mb-2">Knowledge Bank</h2>
        <p className="text-legal-500 text-sm mb-6">Upload Exams, Lectures (Audio), and Readings (PDFs). The AI strictly uses this bank for analysis.</p>
        
        {/* Category Selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['Exam', 'Lecture', 'Reading', 'Case', 'Statute'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setCategory(t)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                category === t 
                  ? 'bg-legal-800 text-white border-legal-800' 
                  : 'bg-white text-legal-600 border-legal-200 hover:bg-legal-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Upload Area */}
        <div className="mb-6 space-y-3">
             {/* File Trigger */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-legal-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-legal-50 transition-colors group"
            >
                <div className="flex gap-4 text-legal-400 group-hover:text-legal-600 mb-2">
                    <FileText size={24} />
                    <Music size={24} />
                    <Upload size={24} />
                </div>
                <span className="text-sm font-medium text-legal-600">Click to upload PDF, Audio, or Text</span>
                <span className="text-xs text-legal-400 mt-1">Max 10MB per file.</span>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="application/pdf,audio/*,text/plain" 
                    multiple
                    className="hidden" 
                />
            </div>
            
            {/* Text Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
                    placeholder="Or type a quick note/rule..."
                    className="flex-1 bg-legal-50 border border-legal-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-legal-400"
                />
                <button 
                    onClick={handleAddText}
                    disabled={!text.trim()}
                    className="bg-legal-200 text-legal-700 px-4 rounded-lg font-medium hover:bg-legal-300 text-sm"
                >
                    Add
                </button>
            </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex gap-2 items-start animate-fade-in">
                <AlertOctagon size={16} className="mt-0.5 shrink-0" />
                <div>
                    <span className="font-bold">Error:</span> {errorMessage}
                </div>
            </div>
        )}

        {/* Materials List */}
        <div className="flex-1 mb-6">
            <h3 className="text-xs font-bold text-legal-400 uppercase tracking-wider mb-2">Active Materials ({materials.length})</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {materials.length === 0 && (
                    <p className="text-xs text-legal-400 italic">No materials in knowledge bank yet.</p>
                )}
                {materials.map((m) => (
                    <div key={m.id} className="bg-legal-50 border border-legal-200 rounded p-2 flex items-center justify-between group">
                        <div className="flex items-center gap-3 overflow-hidden">
                             <div className="w-8 h-8 bg-white border border-legal-200 rounded flex items-center justify-center text-legal-500 shrink-0">
                                {m.type === 'file' ? (m.mimeType?.includes('audio') ? <Music size={14}/> : <FileIcon size={14}/>) : <FileText size={14}/>}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-bold text-legal-800 truncate">{m.name}</p>
                                <p className="text-[10px] text-legal-500 uppercase">{m.category}</p>
                            </div>
                        </div>
                        <button onClick={() => removeMaterial(m.id)} className="text-legal-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Analysis Buttons */}
        <div className="space-y-3 mt-auto">
             <button
                onClick={() => handleAnalyze('PATTERNS')}
                disabled={isGenerating || materials.length === 0}
                className="w-full bg-legal-800 text-white font-medium py-3 rounded-lg hover:bg-legal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
                {isGenerating ? 'Analyzing...' : <><Brain size={18} /> Find Patterns & Top Issues</>}
            </button>
            
            <div className="flex gap-2">
                <button
                    onClick={() => handleAnalyze('RULES')}
                    disabled={isGenerating || materials.length === 0}
                    className="flex-1 bg-white border border-legal-300 text-legal-700 font-medium py-3 rounded-lg hover:bg-legal-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Scale size={18} /> Master Rule Bank
                </button>
                <button
                    onClick={() => handleAnalyze('OUTLINE')}
                    disabled={isGenerating || materials.length === 0}
                    className="flex-1 bg-white border border-legal-300 text-legal-700 font-medium py-3 rounded-lg hover:bg-legal-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <List size={18} /> Class Outline
                </button>
            </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="w-1/2 bg-legal-50 flex flex-col h-full overflow-hidden">
        <div className="h-16 border-b border-legal-200 flex items-center px-6 bg-white shrink-0">
          <h2 className="font-serif font-bold text-legal-800 text-lg flex items-center gap-2">
            <Book size={20} className="text-legal-600" />
            Analysis Results
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          {generatedOutput ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-legal-200 min-h-full">
               <div className="flex justify-between items-center mb-6 border-b border-legal-100 pb-4">
                  <span className="text-xs font-bold tracking-wider text-legal-400 uppercase">Analysis Complete</span>
                  <span className="text-green-600 flex items-center gap-1 text-xs font-medium"><CheckCircle size={12} /> Synced with Knowledge Bank</span>
               </div>
               <MarkdownRenderer content={generatedOutput} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-legal-400 space-y-4">
              <Brain size={48} className="opacity-20" />
              <p className="text-center max-w-xs text-sm">
                Add exams and notes to the Knowledge Bank, then click an analysis button to see patterns, rules, and outlines here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { PenTool, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import { generatePracticeHypo } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ExamPrepProps {
    onSendMessage: (text: string) => void;
}

export const ExamPrep: React.FC<ExamPrepProps> = ({ onSendMessage }) => {
    const [topic, setTopic] = useState('');
    const [hypo, setHypo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        const result = await generatePracticeHypo(topic);
        setHypo(result);
        setLoading(false);
    };

    const handleAnswerRequest = () => {
        if (hypo) {
            onSendMessage(`Please write a model IRAC answer for this hypothetical: ${hypo}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-legal-50 p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full">
                <div className="mb-8 text-center">
                    <h1 className="font-serif text-3xl font-bold text-legal-900 mb-2">Exam Simulation Lab</h1>
                    <p className="text-legal-600">Generate hypothetical fact patterns to practice your issue spotting and rule application.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-legal-200 mb-8">
                    <label className="block text-sm font-semibold text-legal-700 mb-2">Target Topic</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Data Breach Standing, GDPR Consent, CFAA 'Without Authorization'"
                            className="flex-1 border border-legal-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-legal-400 outline-none"
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={loading || !topic}
                            className="bg-legal-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-legal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : <PenTool size={18} />}
                            Generate Hypo
                        </button>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-xs text-legal-400 font-medium uppercase tracking-wide">Popular Topics:</span>
                        {['CFAA Damage vs Loss', 'FTC Unfairness', 'Article III Standing', 'HIPAA Business Associates', 'CCPA Private Right of Action'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setTopic(t)}
                                className="text-xs bg-legal-50 text-legal-600 px-2 py-1 rounded hover:bg-legal-100 border border-legal-200"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {hypo && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white border-l-4 border-highlight rounded-r-lg p-8 shadow-sm relative">
                            <div className="absolute top-4 right-4 text-legal-300">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="font-serif font-bold text-lg text-legal-900 mb-4">Hypothetical Fact Pattern</h3>
                            <MarkdownRenderer content={hypo} />
                        </div>

                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={handleAnswerRequest}
                                className="bg-legal-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-legal-600 transition-colors flex items-center gap-2 shadow-md"
                            >
                                <Eye size={18} />
                                Reveal Model Answer (IRAC)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { MaterialInput } from './components/MaterialInput';
import { ExamPrep } from './components/ExamPrep';
import { AppMode, Message, Role, StudyContext } from './types';
import { generateTutorResponse } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studyContext, setStudyContext] = useState<StudyContext | null>(null);

  const handleSendMessage = async (text: string) => {
    // Optimistic Update
    const userMsg: Message = {
      id: generateId(),
      role: Role.USER,
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // If we are in exam mode and asking for an answer, switch to chat to show it
    if (mode === AppMode.EXAM_PREP) {
        setMode(AppMode.CHAT);
    }

    try {
      const responseText = await generateTutorResponse(messages.concat(userMsg), studyContext, text);
      
      const botMsg: Message = {
        id: generateId(),
        role: Role.MODEL,
        content: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: generateId(),
        role: Role.SYSTEM,
        content: "Sorry, I encountered an error connecting to the Tutor.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
      setMessages([]);
      setStudyContext(null);
  };

  return (
    <div className="flex h-screen w-full bg-legal-50">
      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        studyContext={studyContext}
        setStudyContext={setStudyContext}
        onClearChat={handleClearChat}
      />
      
      <main className="flex-1 h-full overflow-hidden relative">
        {mode === AppMode.CHAT && (
          <ChatArea 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
          />
        )}
        
        {mode === AppMode.OUTLINE && (
          <MaterialInput 
            currentContext={studyContext}
            onSetContext={setStudyContext}
          />
        )}

        {mode === AppMode.EXAM_PREP && (
            <ExamPrep 
                onSendMessage={handleSendMessage}
            />
        )}
      </main>
    </div>
  );
};

export default App;
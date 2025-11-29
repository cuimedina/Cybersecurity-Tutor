import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { MaterialInput } from './components/MaterialInput';
import { ExamPrep } from './components/ExamPrep';
import { AppMode, Message, Role, StudyContext } from './types';
import { generateTutorResponse } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);

// Pre-loaded content
const CHAPTER_ONE_CONTENT = `Practice Quiz for Chapter One CHAPTER ONE: INTRODUCTION

Why are reasonable security measures an evolving concept? 
Reasonable security measures are considered an evolving concept primarily because technology is constantly changing. This evolution means that new ways to attack systems are continuously being discovered. The standard of reasonableness must be flexible to account for these technological changes. For example, the FTC intended for regulation to be flexible so it could regulate unfair practices involving technologies that develop in the future.

What is the security triad? What do each part of the triad mean? 
The foundational security triad is CIA:
Confidentiality: The protection of data objects and resources.
Integrity: The protection of the reliability and correctness of data.
Availability: Uninterrupted, timely access to data objects and resources for appropriately authenticated and authorized users.
Resilience (often added): Ensures that systems and processes will continue to run even after a cyber attack.

What is PII? 
Personally Identifiable Information. It is well known that PII, particularly Social Security numbers, is a valuable commodity and a frequent target of cyber criminals.

What are the four main types of privacy identified by the IAPP? 
Decisional privacy (personal choices) and Informational privacy (controlling information).

What is the definition of cybersecurity that the book uses? 
The protection of digital data, networks and machines.

What is the core responsibility of the cybersecurity professional? 
First, to protect human life. Then, a risk-based approach including vulnerability analysis, security programs, monitoring, and incident response.

How is cybersecurity risk measured? 
Risk = Threat x Vulnerability.
Quantitative Analysis: Uses numbers/probabilities.
Qualitative Analysis: Ranks risks (low, medium, high).

What is a vulnerability analysis? 
Finding weaknesses in a system (scanning, testing) and ranking them (critical, high, medium, low).

What is a patch? What is configuration? 
Patch: Software released to fix a vulnerability.
Configuration: Settings of software. Security issues can often be fixed by reconfiguring rather than patching.

What are gray hat, black hat and white hat hackers? 
White hat: Security researchers/good faith testing.
Gray hat: Unaffiliated consultants, may seek payment.
Black hat: Malicious actors trying to hurt/steal.

What is cybersecurity by design? 
Integrating security early in development (DevSecOps), not as an afterthought.

What is the difference between an event and an incident? 
Event: Single occurrence (login).
Incident: A collection of events indicating a serious problem.

What are the steps of the NIST incident response life cycle? 
1. Preparation
2. Detection and Analysis
3. Containment (Most important)
4. Eradication
5. Recovery
6. Lessons learned

Please list Equifax’s cybersecurity deficiencies? 
Failure to patch, failure to encrypt, sensitive data on public servers, inadequate monitoring, expired certificates, inadequate authentication.`;

const DEFAULT_CONTEXT: StudyContext = {
    materials: [
        {
            id: 'default-chap-1',
            name: 'Chapter 1: Intro Quiz & Concepts',
            type: 'text',
            category: 'Reading',
            content: CHAPTER_ONE_CONTENT
        }
    ]
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studyContext, setStudyContext] = useState<StudyContext | null>(DEFAULT_CONTEXT);

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
      // We keep the default context even on clear, or user can manually delete in sidebar
      setStudyContext(DEFAULT_CONTEXT);
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
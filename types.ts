export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface OutlineSection {
  id: string;
  title: string;
  content: string;
}

export interface StudyMaterial {
  id: string;
  name: string;
  type: 'text' | 'file';
  content: string; // text content or base64 data
  mimeType?: string; // for files
  category: 'Lecture' | 'Reading' | 'Statute' | 'Case' | 'Exam';
}

export interface StudyContext {
  materials: StudyMaterial[];
}

export enum AppMode {
  CHAT = 'CHAT',
  OUTLINE = 'OUTLINE',
  EXAM_PREP = 'EXAM_PREP'
}
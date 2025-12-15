
export enum ChatMode {
  TEXT = 'TEXT',
  VOICE = 'VOICE'
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isQuiz?: boolean; // Indique si le message contient un quiz structuré
  quizData?: QuizQuestion[]; // Données du quiz si applicable
}

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    lastModified: Date;
}

export interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  volume: number;
}

export interface GlossaryItem {
  term: string;
  definition: string;
  category?: 'Actes' | 'Police' | 'Service Public' | 'Contentieux';
}

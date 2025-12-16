
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, ChatSession, ChatMode, QuizQuestion, Attachment } from '../types';
import { SYSTEM_INSTRUCTION, GLOSSARY_DATA } from '../constants';
import { decodeAudioData } from '../utils/audio-utils';
import { fileToBase64, exportSessionToPDF } from '../utils/file-utils';

// --- Helper Functions ---
const cleanTextForTTS = (text: string) => text.replace(/[*#]/g, '').replace(/- /g, '').trim();

const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const SimpleMarkdown = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  lines.forEach((line, index) => {
    if (line.startsWith('### ')) {
       elements.push(<h3 key={index} className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">{parseBold(line.replace('### ', ''))}</h3>);
    } else if (line.startsWith('- ')) {
       elements.push(<li key={index} className="ml-4 list-disc text-slate-700 dark:text-slate-300 mb-1">{parseBold(line.replace('- ', ''))}</li>);
    } else if (line.trim() !== '') {
       elements.push(<p key={index} className="text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">{parseBold(line)}</p>);
    }
  });
  return <div>{elements}</div>;
};

// --- Sub-components ---

const QuizDisplay = ({ data }: { data: QuizQuestion[] }) => {
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const q = data[idx];

    const handleSelect = (i: number) => {
        if (selected !== null) return;
        setSelected(i);
        if (i === q.correctAnswerIndex) setScore(s => s + 1);
    };

    const next = () => {
        if (idx < data.length - 1) {
            setIdx(idx + 1);
            setSelected(null);
        } else {
            alert(`Quiz terminé ! Score: ${score}/${data.length}`);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl p-4 mt-2 transition-colors">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Quiz {idx + 1}/{data.length}</div>
            <p className="font-bold text-slate-800 dark:text-white mb-4">{q.question}</p>
            <div className="space-y-2">
                {q.options.map((opt, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleSelect(i)}
                        className={`w-full text-left p-3 rounded-lg text-sm border transition-colors ${selected !== null 
                            ? i === q.correctAnswerIndex 
                                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                                : i === selected ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' : 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-700 text-slate-400'
                            : 'bg-white dark:bg-[#1E293B] border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
            {selected !== null && (
                <div className="mt-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg mb-3">{q.explanation}</p>
                    <button onClick={next} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-500">Suivant</button>
                </div>
            )}
        </div>
    );
};

interface TextChatProps {
    messages: Message[];
    onMessagesUpdate: (messages: Message[]) => void;
}

const TextChat: React.FC<TextChatProps> = ({ messages, onMessagesUpdate }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const API_KEY = import.meta.env.VITE_API_KEY;

  // --- ACTIONS RAPIDES (PILLS) ---
  const quickActions = [
    { label: "Explication", prompt: "Explique-moi simplement la notion suivante : ", color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/40", icon: "💡" },
    { label: "Quiz Rapide", prompt: "Pose-moi une question rapide sur un ou plusieurs thèmes du cours que je vais t'indiquer.", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40", icon: "❓" },
    { label: "Générer QCM", prompt: "Génère un QCM de 3 questions sur un ou plusieurs thèmes du cours que je vais t'indiquer.", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40", icon: "✅" },
    { label: "Cas Pratique", prompt: "Soumets-moi un petit cas pratique sur un ou plusieurs thèmes du cours que je vais t'indiquer.", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40", icon: "📖" },
    { label: "Vrai/Faux", prompt: "Propose-moi une affirmation Vrai/Faux sur un ou plusieurs thèmes du cours que je vais t'indiquer.", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40", icon: "⚖️" }
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.type === 'application/pdf') {
              setSelectedFile(file);
          } else {
              alert("Seuls les fichiers PDF sont acceptés pour le moment.");
          }
      }
  };

  const removeFile = () => {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && !selectedFile) || isLoading) return;
    if (!API_KEY) return;

    // Préparation de l'attachment
    let attachmentData: Attachment | undefined = undefined;
    if (selectedFile) {
        try {
            const base64Data = await fileToBase64(selectedFile);
            attachmentData = {
                name: selectedFile.name,
                mimeType: selectedFile.type,
                data: base64Data
            };
        } catch (e) {
            console.error("Erreur lecture fichier", e);
        }
    }

    const userMsg: Message = { 
        role: 'user', 
        text: text, 
        timestamp: new Date(),
        attachment: attachmentData
    };

    const updatedMessages = [...messages, userMsg];
    onMessagesUpdate(updatedMessages);
    
    setInput('');
    setSelectedFile(null); // Clear file after send
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const historyForApi = updatedMessages.map(m => {
          // Gestion des messages passés
          const parts: any[] = [];
          
          if (m.attachment) {
              parts.push({
                  inlineData: {
                      mimeType: m.attachment.mimeType,
                      data: m.attachment.data
                  }
              });
          }
          
          if (m.isQuiz && m.quizData) {
              parts.push({ text: `[SYSTEM: L'IA a généré ce QCM: ${JSON.stringify(m.quizData)}]` });
          } else if (m.text) {
              parts.push({ text: m.text });
          }

          return { 
              role: m.role, 
              parts: parts 
          };
      });

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
            ...historyForApi
        ]
      });
      
      const responseText = result.text || "";
      let botMsg: Message = { role: 'model', text: responseText, timestamp: new Date() };

      if (responseText.trim().startsWith('[') && responseText.trim().endsWith(']')) {
         try {
             botMsg.quizData = JSON.parse(responseText);
             botMsg.isQuiz = true;
             botMsg.text = "Voici le QCM demandé :";
         } catch(e) {}
      }

      onMessagesUpdate([...updatedMessages, botMsg]);
    } catch (error) {
      console.error(error);
      onMessagesUpdate([...updatedMessages, { role: 'model', text: "Erreur de connexion ou fichier trop volumineux.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0B1120] relative transition-colors duration-300">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth pb-44 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {/* AVATAR GAUCHE (BOT) */}
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
            )}

            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* PDF Attachment Bubble */}
                {msg.attachment && (
                    <div className={`mb-2 flex items-center gap-2 p-3 rounded-xl border ${msg.role === 'user' ? 'bg-blue-700 text-blue-100 border-blue-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div className="text-xs overflow-hidden">
                            <p className="font-bold truncate max-w-[150px]">{msg.attachment.name}</p>
                            <p className="opacity-80">PDF Document</p>
                        </div>
                    </div>
                )}

                <div 
                    className={`px-6 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed transition-colors duration-200 ${
                        msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                    }`}
                >
                    {msg.isQuiz && msg.quizData ? (
                        <QuizDisplay data={msg.quizData} />
                    ) : (
                        msg.role === 'user' ? msg.text : <SimpleMarkdown text={msg.text} />
                    )}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 px-1">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            </div>

            {/* AVATAR DROITE (USER) */}
            {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 mt-1 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
            )}

          </div>
        ))}
        {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mt-1"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg></div>
                <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm transition-colors"><div className="flex gap-1 h-2 items-center"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div></div></div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT CONTAINER - FIXED BOTTOM */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20">
        
        {/* Pills / Quick Actions */}
        {!isLoading && !selectedFile && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide justify-center">
                {quickActions.map((action, i) => (
                    <button 
                        key={i}
                        onClick={() => sendMessage(action.prompt)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shadow-sm whitespace-nowrap ${action.color}`}
                    >
                        <span>{action.icon}</span> {action.label}
                    </button>
                ))}
            </div>
        )}

        {/* Selected File Preview */}
        {selectedFile && (
             <div className="mb-2 mx-auto max-w-fit bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl p-2 pr-4 flex items-center gap-3 shadow-lg animate-in slide-in-from-bottom-2">
                <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div className="text-sm">
                    <p className="font-bold text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">PDF Document</p>
                </div>
                <button onClick={removeFile} className="ml-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
        )}

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 p-1.5 flex items-end gap-2 transition-colors">
            
            {/* File Upload Button */}
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="application/pdf"
                className="hidden"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors mb-1"
                title="Joindre un PDF"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </button>

            <textarea 
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez une question ou envoyez un PDF..." 
                rows={1}
                className="flex-1 bg-transparent border-0 py-3 px-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 text-base resize-none max-h-[200px] overflow-y-auto custom-scrollbar"
                autoFocus
            />
            <button 
                onClick={() => sendMessage(input)}
                disabled={(!input.trim() && !selectedFile) || isLoading}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 mb-1"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
        </div>
      </div>

    </div>
  );
};

export default TextChat;

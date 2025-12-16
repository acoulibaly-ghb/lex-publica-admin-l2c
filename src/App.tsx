
import React, { useState, useEffect } from 'react';
import { ChatMode, ChatSession, Message } from './types';
import TextChat from './components/TextChat';
import VoiceChat from './components/VoiceChat';
import HelpModal from './components/HelpModal';

// Message d'accueil par défaut
const WELCOME_MESSAGE: Message = { 
    role: 'model', 
    text: 'Bonjour ! Je suis **Ada**, l\'IA de Lex publica entraînée par le **professeur Coulibaly**. Comment puis-je vous aider sur le cours de Droit administratif ?', 
    timestamp: new Date() 
};

const App: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>(ChatMode.TEXT);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Gestion de l'affichage de la Sidebar
  // Par défaut : Fermée sur mobile (< 768px), Ouverte sur desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gestion des Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([
      { id: '1', title: 'Nouvelle discussion', messages: [WELCOME_MESSAGE], lastModified: new Date() }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('1');
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  // Renaming states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  // Appliquer la classe 'dark'
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Session Logic ---

  const createNewSession = () => {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
          id: newId,
          title: 'Nouvelle discussion',
          messages: [{ ...WELCOME_MESSAGE, timestamp: new Date() }],
          lastModified: new Date()
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newId);
      setMode(ChatMode.TEXT);
      if (isMobile) setIsSidebarOpen(false); // Fermer le menu sur mobile après création
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (id === currentSessionId) {
        if (newSessions.length > 0) {
            setCurrentSessionId(newSessions[0].id);
        } else {
            const newId = Date.now().toString();
            setSessions([{ id: newId, title: 'Nouvelle discussion', messages: [{...WELCOME_MESSAGE}], lastModified: new Date() }]);
            setCurrentSessionId(newId);
        }
    }
  };

  const startEditing = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setTempTitle(session.title);
  };

  const saveTitle = () => {
    if (editingId !== null && tempTitle.trim()) {
      setSessions(prev => prev.map(s => s.id === editingId ? { ...s, title: tempTitle.trim() } : s));
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveTitle();
    else if (e.key === 'Escape') setEditingId(null);
  };

  const selectSession = (id: string) => {
      setCurrentSessionId(id);
      setMode(ChatMode.TEXT);
      if (isMobile) setIsSidebarOpen(false); // Fermer le menu sur mobile après sélection
  };

  const updateCurrentSessionMessages = (newMessages: Message[]) => {
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
              let newTitle = s.title;
              if (s.messages.length === 1 && newMessages.length > 1 && s.title === 'Nouvelle discussion') {
                  const firstUserMsg = newMessages.find(m => m.role === 'user');
                  if (firstUserMsg) {
                      newTitle = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
                  }
              }
              return { ...s, messages: newMessages, title: newTitle, lastModified: new Date() };
          }
          return s;
      }));
  };

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans transition-colors duration-300 ${darkMode ? 'dark bg-[#0B1120]' : 'bg-[#F3F4F6]'}`}>
      
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* OVERLAY MOBILE */}
      {isMobile && isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Unified for Desktop/Mobile) */}
      <aside 
        className={`
            fixed md:relative z-30 h-full bg-[#0F172A] border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#0F172A] flex-shrink-0 whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
             </div>
             <h1 className="font-bold text-white text-lg tracking-tight opacity-100 transition-opacity duration-200">Droit Public</h1>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar w-72">
            
            {/* Mode de communication */}
            <div className="w-full">
                <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Mode de communication</h3>
                
                <button 
                    onClick={() => { setMode(ChatMode.VOICE); if(isMobile) setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 mb-4 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    mode === ChatMode.VOICE 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                >
                    <svg className={`w-5 h-5 flex-shrink-0 ${mode === ChatMode.VOICE ? 'text-white' : 'text-blue-400 group-hover:text-blue-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                    <span>Mode Oral (Live)</span>
                </button>

                {/* Historique Header */}
                <div className="flex items-center justify-between px-2 mb-2 group cursor-pointer" onClick={() => setIsHistoryOpen(!isHistoryOpen)}>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-400 transition-colors">Discussions</h3>
                    <button className={`text-slate-600 hover:text-slate-400 transition-transform duration-200 ${isHistoryOpen ? 'rotate-90' : ''}`}>
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Historique List */}
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isHistoryOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    
                    <button 
                        onClick={createNewSession}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/30 text-slate-400 hover:text-white mb-2`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Nouvelle discussion
                    </button>

                    {sessions.map((session) => (
                        <div 
                            key={session.id}
                            onClick={() => selectSession(session.id)}
                            className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                mode === ChatMode.TEXT && currentSessionId === session.id && editingId !== session.id
                                ? 'bg-slate-800 text-white shadow-lg shadow-black/20' 
                                : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                <svg className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-blue-500' : 'opacity-50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                                
                                {editingId === session.id ? (
                                    <input 
                                        type="text"
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={saveTitle}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-slate-900 text-white text-xs px-2 py-1 rounded border border-blue-500 w-full outline-none"
                                    />
                                ) : (
                                    <span className="truncate">{session.title}</span>
                                )}
                            </div>
                            
                            {editingId !== session.id && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button onClick={(e) => startEditing(e, session)} className="p-1 hover:bg-slate-700 text-slate-500 hover:text-white rounded transition-colors" title="Renommer">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                     </button>
                                     <button onClick={(e) => deleteSession(e, session.id)} className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors" title="Supprimer">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/*  <div className="pt-4 border-t border-slate-800/50 w-full">
                <h3 className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Espace Professeur</h3>
                <nav className="space-y-1">
                    <button className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors opacity-70 cursor-not-allowed text-slate-400" title="Gérer le Cours">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        <span>Gérer le Cours</span>
                    </button>
                </nav>
            </div> */}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B1120] flex flex-col flex-shrink-0 w-72">
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center justify-start gap-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg transition-all mb-6 w-full group"
                title={darkMode ? "Mode Clair" : "Mode Sombre"}
            >
                {darkMode ? (
                    <>
                        <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <span className="group-hover:text-amber-300 transition-colors">Mode Clair</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        <span className="group-hover:text-indigo-300 transition-colors">Mode Sombre</span>
                    </>
                )}
            </button>
            <div className="space-y-4">
                <div className="text-xs text-slate-500 font-medium space-y-1">
                    <p className="text-slate-400 font-semibold">Université Toulouse Capitole</p>
                    <p>Année universitaire 2025-2026</p>
                </div>
                <div className="h-px bg-slate-800"></div>
                <div className="text-[11px] text-slate-600 space-y-1.5">
                    <p className="flex items-center gap-1.5"><svg className="w-3 h-3 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>Propulsé par Google Gemini 2.5</p>
                    <p>Design by A. Coulibaly</p>
                    <p className="text-slate-700 italic mt-2">L'IA peut faire des erreurs.</p>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-300">
         
         {/* HEADER */}
         <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-10 transition-colors duration-300 flex-shrink-0">
            <div className="flex items-center gap-3">
                {/* SIDEBAR TOGGLE BUTTON */}
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </button>

                <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors truncate">
                    Lex publica IA <span className="text-slate-400 dark:text-slate-500 font-normal hidden sm:inline">by Coulibaly</span>
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={() => setIsHelpOpen(true)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-all duration-200 cursor-pointer" title="Aide & Ressources">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="hidden sm:inline">Système prêt</span>
                    <span className="sm:hidden">Prêt</span>
                </div>
            </div>
         </header>

         {/* MAIN CONTENT */}
         <main className="flex-1 relative overflow-hidden">
            {mode === ChatMode.TEXT ? (
                <TextChat 
                    messages={currentSession.messages} 
                    onMessagesUpdate={updateCurrentSessionMessages}
                />
            ) : (
                <VoiceChat />
            )}
         </main>
      </div>
    </div>
  );
};

export default App;

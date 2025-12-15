
import React, { useState, useEffect } from 'react';
import { ChatMode } from './types';
import TextChat from './components/TextChat';
import VoiceChat from './components/VoiceChat';
import HelpModal from './components/HelpModal';

const App: React.FC = () => {
  const [mode, setMode] = useState<ChatMode>(ChatMode.TEXT);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Appliquer la classe 'dark' au body ou au wrapper principal
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans transition-colors duration-300 ${darkMode ? 'dark bg-[#0B1120]' : 'bg-[#F3F4F6]'}`}>
      
      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* SIDEBAR (Always Dark Theme visually, but consistent) */}
      <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col flex-shrink-0 transition-all duration-300 border-r border-slate-800">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
             </div>
             <h1 className="font-bold text-white text-lg tracking-tight">Droit Public</h1>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
            
            {/* Section 1 */}
            <div>
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Espace Public</h3>
                <nav className="space-y-1">
                    <button 
                        onClick={() => setMode(ChatMode.TEXT)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            mode === ChatMode.TEXT 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                            : 'hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        Discussion
                    </button>
                    <button 
                         onClick={() => setMode(ChatMode.VOICE)}
                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            mode === ChatMode.VOICE 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                            : 'hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
                        Mode Oral (Live)
                    </button>
                </nav>
            </div>

            {/* Section 2 */}
            <div>
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Espace Professeur</h3>
                <nav className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors opacity-70 cursor-not-allowed">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        Gérer le Cours
                    </button>
                </nav>
            </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B1120]">
            
            {/* Dark Mode Toggle */}
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 p-2 rounded-lg transition-all mb-6 w-full group"
            >
                {darkMode ? (
                    <>
                        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <span className="group-hover:text-amber-300 transition-colors">Mode Clair</span>
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
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
                    <p className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                        Propulsé par Google Gemini 2.5
                    </p>
                    <p>Design by A. Coulibaly</p>
                    <p className="text-slate-700 italic mt-2">L'IA peut faire des erreurs.</p>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full relative">
         
         {/* HEADER */}
         <header className="h-16 bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 z-10 transition-colors duration-300">
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Lex publica IA <span className="text-slate-400 dark:text-slate-500 font-normal">by Coulibaly</span></h2>
            </div>
            <div className="flex items-center gap-4">
                 {/* Bouton d'aide (Ampoule) */}
                <button 
                    onClick={() => setIsHelpOpen(true)}
                    className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-all duration-200 cursor-pointer"
                    title="Aide & Ressources"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Système prêt
                </div>
            </div>
         </header>

         {/* CONTENT CONTAINER */}
         <main className="flex-1 relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-300">
            {mode === ChatMode.TEXT ? <TextChat /> : <VoiceChat />}
         </main>

      </div>
    </div>
  );
};

export default App;

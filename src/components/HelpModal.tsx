
import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/20 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-start gap-4 relative bg-white dark:bg-[#1E293B]">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-500 ring-1 ring-amber-100 dark:ring-amber-900/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aide & Ressources</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Guide de l'assistant pédagogique</p>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-white dark:bg-[#1E293B]">
            
            {/* Section À propos */}
            <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2 text-sm uppercase tracking-wide">
                    <span className="text-blue-600 dark:text-blue-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></span>
                    À propos de l'assistant
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    Cette IA est programmée pour répondre aux questions <strong>exclusivement basées sur le cours de Droit Public</strong> fourni par votre professeur. Elle ne répondra pas aux questions hors sujet.
                </p>
            </div>

            {/* Section Fonctionnalités */}
            <div>
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4 text-sm uppercase tracking-wide">
                    <span className="text-purple-600 dark:text-purple-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>
                    Fonctionnalités interactives
                </h3>
                <div className="space-y-4">
                    <div className="flex gap-4 group">
                         <div className="mt-0.5 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded-lg group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></div>
                         <div>
                             <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Explication</h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Demandez des éclaircissements sur des concepts complexes.</p>
                         </div>
                    </div>
                    <div className="flex gap-4 group">
                         <div className="mt-0.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                         <div>
                             <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Quiz & QCM</h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Testez vos connaissances avec des exercices corrigés.</p>
                         </div>
                    </div>
                    <div className="flex gap-4 group">
                         <div className="mt-0.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                         <div>
                             <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cas Pratique</h4>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Entraînez-vous au raisonnement juridique.</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Section Liens Utiles */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
                 <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3 text-sm uppercase tracking-wide">
                    <span className="text-slate-500 dark:text-slate-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></span>
                    Liens utiles
                </h3>
                <ul className="space-y-2 text-sm pl-1">
                    <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-2 transition-colors"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>Portail de l'Université</a></li>
                    <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-2 transition-colors"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>Syllabus du cours (PDF)</a></li>
                </ul>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <button onClick={onClose} className="w-full py-3 bg-[#0F172A] text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.99]">
                J'ai compris
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;


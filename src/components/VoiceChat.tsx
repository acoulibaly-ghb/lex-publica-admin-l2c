
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants';
import { createPcmBlob, decodeAudioData } from '../utils/audio-utils';
import Visualizer from './Visualizer';

const VoiceChat: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'listening' | 'speaking'>('disconnected');
  const [volume, setVolume] = useState(0);
  const [transcriptionHistory, setTranscriptionHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const transcriptionRef = useRef('');
  
  const historyRef = useRef<HTMLDivElement>(null);
  const API_KEY = import.meta.env.VITE_API_KEY;

  // ... (Garder les fonctions audio identiques, juste simplifier le render) ...
  // Pour la concision de la réponse, je garde la logique existante mais j'adapte le JSX au nouveau style.

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [transcriptionHistory, currentTranscription]);

  const analyzeAudio = () => {
    if (!analyserRef.current) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    let sum = 0; for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    setVolume(Math.min(100, (sum / bufferLength) * 2.5));
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const cleanupAudio = () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (processorRef.current) processorRef.current.disconnect();
      if (inputSourceRef.current) inputSourceRef.current.disconnect();
      scheduledSourcesRef.current.forEach(s => { try { s.stop() } catch(e) {} });
      if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
  };

  const stopSession = () => {
      cleanupAudio();
      setIsConnected(false); setStatus('disconnected'); setVolume(0);
      setCurrentTranscription(''); transcriptionRef.current = '';
  };

  const startSession = async () => {
      if (!API_KEY) return alert("Clé API manquante");
      setStatus('connecting');
      try {
          const ai = new GoogleGenAI({ apiKey: API_KEY });
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
          const inputContext = new AudioContextClass({ sampleRate: 16000 });
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          
          const analyser = inputContext.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          const source = inputContext.createMediaStreamSource(stream);
          const processor = inputContext.createScriptProcessor(4096, 1, 1);
          inputSourceRef.current = source; processorRef.current = processor;
          source.connect(analyser); source.connect(processor); processor.connect(inputContext.destination);
          analyzeAudio();

          const sessionPromise = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-09-2025',
              config: { responseModalities: [Modality.AUDIO], systemInstruction: SYSTEM_INSTRUCTION, outputAudioTranscription: {} },
              callbacks: {
                  onopen: () => { setIsConnected(true); setStatus('listening'); },
                  onmessage: async (msg: LiveServerMessage) => {
                      if (msg.serverContent?.outputTranscription) {
                          transcriptionRef.current += msg.serverContent.outputTranscription.text;
                          setCurrentTranscription(transcriptionRef.current);
                      }
                      if (msg.serverContent?.turnComplete && transcriptionRef.current) {
                          setTranscriptionHistory(p => [...p, {role: 'model', text: transcriptionRef.current}]);
                          transcriptionRef.current = ''; setCurrentTranscription('');
                      }
                      const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                      if (audioData && audioContextRef.current) {
                          setStatus('speaking');
                          const buffer = await decodeAudioData(audioData, audioContextRef.current);
                          const src = audioContextRef.current.createBufferSource();
                          src.buffer = buffer;
                          src.connect(audioContextRef.current.destination);
                          const start = Math.max(audioContextRef.current.currentTime, nextStartTimeRef.current);
                          src.start(start);
                          nextStartTimeRef.current = start + buffer.duration;
                          scheduledSourcesRef.current.push(src);
                          src.onended = () => { 
                              scheduledSourcesRef.current = scheduledSourcesRef.current.filter(s => s !== src);
                              if (scheduledSourcesRef.current.length === 0) setStatus('listening');
                          };
                      }
                  },
                  onclose: stopSession,
                  onerror: () => stopSession()
              }
          });
          sessionPromiseRef.current = sessionPromise;
          processor.onaudioprocess = (e) => {
              const pcmBlob = createPcmBlob(e.inputBuffer.getChannelData(0));
              sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
      } catch (e) { stopSession(); }
  };

  useEffect(() => () => stopSession(), []);

  return (
    <div className="h-full bg-slate-900 flex flex-col relative overflow-hidden">
        {/* Visual Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-96 h-96 rounded-full blur-[100px] transition-all duration-1000 ${status === 'speaking' ? 'bg-green-500/20' : status === 'listening' ? 'bg-blue-600/30' : 'bg-slate-800/50'}`}></div>
        </div>

        {/* Status Indicator */}
        <div className="z-10 text-center mt-12">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium tracking-wide ${status === 'disconnected' ? 'border-slate-700 text-slate-500' : 'border-white/10 text-white bg-white/5 backdrop-blur'}`}>
                <span className={`w-2 h-2 rounded-full ${status === 'disconnected' ? 'bg-slate-500' : 'bg-green-400 animate-pulse'}`}></span>
                {status === 'disconnected' ? 'MICROPHONE DÉSACTIVÉ' : status === 'listening' ? 'À L\'ÉCOUTE...' : status === 'speaking' ? 'IA PARLE' : 'CONNEXION...'}
            </span>
        </div>

        {/* Center Visualizer */}
        <div className="flex-1 flex items-center justify-center z-10">
            <div className="relative">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${status === 'listening' ? 'bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.5)] scale-110' : status === 'speaking' ? 'bg-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)] scale-110' : 'bg-slate-800'}`}>
                    {status === 'disconnected' ? (
                        <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                    ) : (
                        <Visualizer isActive={true} mode={status === 'speaking' ? 'speaking' : 'listening'} volume={volume} />
                    )}
                </div>
            </div>
        </div>

        {/* Live Transcript Overlay */}
        {isConnected && (
            <div className="h-1/3 bg-slate-950/50 backdrop-blur-md border-t border-white/5 p-6 overflow-y-auto z-20 space-y-4" ref={historyRef}>
                 {transcriptionHistory.map((t, i) => (
                     <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <p className={`max-w-[80%] text-sm px-4 py-2 rounded-xl ${t.role === 'user' ? 'bg-slate-800 text-slate-300' : 'bg-blue-900/30 text-blue-200 border border-blue-500/20'}`}>{t.text}</p>
                     </div>
                 ))}
                 {currentTranscription && (
                     <div className="flex justify-start">
                         <p className="max-w-[80%] text-sm px-4 py-2 rounded-xl bg-green-900/30 text-green-200 border border-green-500/20">{currentTranscription}</p>
                     </div>
                 )}
            </div>
        )}

        {/* Controls (Reduced Width) */}
        <div className="p-6 z-30 flex justify-center w-full">
            <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex justify-center backdrop-blur-md shadow-2xl">
                {!isConnected ? (
                    <button onClick={startSession} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        Démarrer le Live
                    </button>
                ) : (
                    <button onClick={stopSession} className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        Arrêter
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default VoiceChat;

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BookOpen, CheckCircle, RefreshCw, Award, Search, 
  ArrowRight, Flame, Sparkles, Book, HelpCircle, Trophy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HandCamera } from '../components/HandCamera';
import axios from 'axios';
import API_URL from '../../config';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

const SIGN_GUIDE: Record<string, { desc: string; difficulty: 'Fácil' | 'Medio' | 'Difícil'; fingers: string }> = {
  A: { desc: 'Mano cerrada en puño. El pulgar se apoya recto contra el lateral del dedo índice.', difficulty: 'Fácil', fingers: 'Todos los dedos doblados, pulgar al lado.' },
  B: { desc: 'Mano abierta con los cuatro dedos juntos y extendidos verticalmente. El pulgar se dobla sobre la palma.', difficulty: 'Fácil', fingers: '4 dedos extendidos, pulgar doblado.' },
  C: { desc: 'Mano arqueada formando una "C" con todos los dedos de manera curva, imitando la forma de la letra.', difficulty: 'Fácil', fingers: 'Todos los dedos curvados en forma de C.' },
  D: { desc: 'Dedo índice extendido hacia arriba. El pulgar y los otros tres dedos se tocan por sus puntas formando un círculo.', difficulty: 'Fácil', fingers: 'Índice extendido, otros cerrados tocando el pulgar.' },
  E: { desc: 'Todos los dedos se doblan fuertemente hacia la palma, y las puntas rozan el pulgar doblado debajo de ellos.', difficulty: 'Difícil', fingers: 'Dedos doblados como garra compacta.' },
  F: { desc: 'Toca las puntas de tu dedo índice y pulgar formando un círculo (gesto de "OK"). Los otros tres dedos apuntan hacia arriba bien separados.', difficulty: 'Medio', fingers: 'Índice y pulgar en círculo, 3 dedos arriba.' },
  G: { desc: 'Apunta con el dedo índice horizontalmente hacia el frente, y coloca el pulgar paralelo arriba, simulando medir un objeto pequeño.', difficulty: 'Medio', fingers: 'Índice y pulgar extendidos horizontalmente.' },
  H: { desc: 'Extiende los dedos índice y medio juntos de forma horizontal. Los dedos anular, meñique y el pulgar se cierran en la palma.', difficulty: 'Medio', fingers: 'Índice y medio horizontales juntos.' },
  I: { desc: 'Extiende únicamente el meñique hacia arriba de forma vertical. Cierra el resto de los dedos y el pulgar sobre ellos.', difficulty: 'Fácil', fingers: 'Meñique arriba, resto cerrados.' },
  J: { desc: 'Con el meñique apuntando hacia arriba, dibuja una curva en forma de "J" (un gancho) en el aire.', difficulty: 'Medio', fingers: 'Meñique arriba dibujando un gancho.' },
  K: { desc: 'Apunta hacia arriba con los dedos índice y medio en forma de "V". Apoya la yema del pulgar en medio de ambos (sobre el dedo medio).', difficulty: 'Difícil', fingers: 'Índice y medio en V, pulgar en medio.' },
  L: { desc: 'Forma una "L" extendiendo el dedo índice hacia arriba y el pulgar hacia un lado en un ángulo de 90 grados.', difficulty: 'Fácil', fingers: 'Índice arriba, pulgar al lado.' },
  M: { desc: 'Cierra el puño y coloca el pulgar metido por debajo de los dedos índice, medio y anular, asomándose entre el anular y el meñique.', difficulty: 'Medio', fingers: 'Puño con pulgar bajo 3 dedos.' },
  N: { desc: 'Cierra el puño y coloca el pulgar por debajo de los dedos índice y medio, asomándose entre el medio y el anular.', difficulty: 'Fácil', fingers: 'Puño con pulgar bajo 2 dedos.' },
  O: { desc: 'Curva todos tus dedos hasta que sus puntas toquen la punta del pulgar, formando una circunferencia o letra "O" perfecta.', difficulty: 'Fácil', fingers: 'Todos los dedos en círculo tocando el pulgar.' },
  P: { desc: 'Apunta con el índice y medio hacia abajo en forma de "V", con el pulgar apoyado entre ambos en el dedo medio.', difficulty: 'Difícil', fingers: 'K invertida apuntando hacia abajo.' },
  Q: { desc: 'Apunta con la mano hacia abajo formando una pinza abierta horizontal con el índice y el pulgar (versión hacia abajo de la G).', difficulty: 'Medio', fingers: 'Índice y pulgar hacia abajo en pinza.' },
  R: { desc: 'Cruza el dedo medio sobre el índice apuntando hacia arriba. Los demás dedos se cierran en la palma con el pulgar.', difficulty: 'Medio', fingers: 'Índice y medio cruzados hacia arriba.' },
  S: { desc: 'Cierra el puño fuertemente y cruza el dedo pulgar de forma horizontal por encima de los dedos medio y anular.', difficulty: 'Fácil', fingers: 'Puño completo con pulgar al frente.' },
  T: { desc: 'Cierra el puño y coloca el pulgar entre el dedo índice y el dedo medio, sobresaliendo hacia arriba.', difficulty: 'Medio', fingers: 'Puño con pulgar entre índice y medio.' },
  U: { desc: 'Extiende los dedos índice y medio rectos hacia arriba y mantenlos completamente pegados. Pulgar e inalámbricos cerrados.', difficulty: 'Fácil', fingers: 'Índice y medio extendidos y pegados.' },
  V: { desc: 'Extiende los dedos índice y medio rectos hacia arriba pero separados en forma de "V" (señal de victoria).', difficulty: 'Fácil', fingers: 'Índice y medio extendidos y separados.' },
  W: { desc: 'Extiende los dedos índice, medio y anular separados hacia arriba en forma de "W". El pulgar sostiene el meñique.', difficulty: 'Medio', fingers: '3 dedos extendidos en W.' },
  X: { desc: 'Cierra el puño y extiende el dedo índice pero doblándolo en forma de gancho apuntando hacia arriba.', difficulty: 'Medio', fingers: 'Índice doblado como gancho, resto cerrados.' },
  Y: { desc: 'Extiende únicamente el pulgar y el meñique hacia los lados. Mantén los tres dedos centrales cerrados contra la palma.', difficulty: 'Fácil', fingers: 'Pulgar y meñique extendidos.' },
  Z: { desc: 'Con el dedo índice extendido apuntando hacia el frente, dibuja una "Z" en el aire en un movimiento continuo.', difficulty: 'Medio', fingers: 'Índice dibuja una Z en el aire.' },
};

const ALPHABET = Object.keys(SIGN_GUIDE);

const SKELETON_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Pulgar
  [0, 5], [5, 6], [6, 7], [7, 8], // Índice
  [0, 9], [9, 10], [10, 11], [11, 12], // Medio
  [0, 13], [13, 14], [14, 15], [15, 16], // Anular
  [0, 17], [17, 18], [18, 19], [19, 20], // Meñique
  [5, 9], [9, 13], [13, 17] // Palma
];

const getScaledPoints = (pts: { x: number; y: number }[], size = 140, padding = 15) => {
  if (!pts || pts.length === 0) return [];
  const xs = pts.map(p => p.x);
  const ys = pts.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  
  const drawSize = size - padding * 2;
  const scale = Math.min(drawSize / width, drawSize / height);
  
  const offsetX = padding + (drawSize - width * scale) / 2 - minX * scale;
  const offsetY = padding + (drawSize - height * scale) / 2 - minY * scale;
  
  return pts.map(p => ({
    x: p.x * scale + offsetX,
    y: p.y * scale + offsetY
  }));
};

export function LearnSign() {
  const [activeLetter, setActiveLetter] = useState('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<{ total_samples: number; labels: Record<string, number> }>({ total_samples: 0, labels: {} });
  const [masteredLetters, setMasteredLetters] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [referenceLandmarks, setReferenceLandmarks] = useState<{ x: number; y: number; z: number }[] | null>(null);
  
  const fetchReference = useCallback(async (letter: string) => {
    try {
      const response = await axios.get(`${API_URL}/reference/${letter}`);
      if (response.data.status === 'success') {
        setReferenceLandmarks(response.data.landmarks);
      } else {
        setReferenceLandmarks(null);
      }
    } catch (e) {
      setReferenceLandmarks(null);
    }
  }, []);

  // Real-time states
  const [currentLetter, setCurrentLetter] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isMatching, setIsMatching] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Refs for stability in the camera callback loop
  const activeLetterRef = useRef(activeLetter);
  const holdProgressRef = useRef(0);
  const isMatchingRef = useRef(false);

  useEffect(() => {
    activeLetterRef.current = activeLetter;
    // Reset accuracy metrics when changing letter
    holdProgressRef.current = 0;
    setHoldProgress(0);
    isMatchingRef.current = false;
    setIsMatching(false);
    setShowCelebration(false);
  }, [activeLetter]);

  // Load stats and progress from localStorage
  const loadProgress = useCallback(() => {
    try {
      const stored = localStorage.getItem('signai_mastered_letters');
      if (stored) {
        setMasteredLetters(new Set(JSON.parse(stored)));
      }
      
      const storedStreak = localStorage.getItem('signai_streak');
      if (storedStreak) {
        setStreak(parseInt(storedStreak, 10));
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    loadProgress();
    fetchStats();
  }, [loadProgress, fetchStats]);

  useEffect(() => {
    fetchReference(activeLetter);
  }, [activeLetter, fetchReference]);

  const handleMastered = (letter: string) => {
    setMasteredLetters(prev => {
      const next = new Set(prev);
      next.add(letter);
      localStorage.setItem('signai_mastered_letters', JSON.stringify(Array.from(next)));
      return next;
    });

    // Streak logic
    const today = new Date().toDateString();
    const lastStreakDate = localStorage.getItem('signai_last_streak_date');
    let currentStreak = parseInt(localStorage.getItem('signai_streak') || '0', 10);
    
    if (lastStreakDate !== today) {
      if (lastStreakDate === new Date(Date.now() - 86400000).toDateString()) {
        currentStreak += 1;
      } else if (!lastStreakDate) {
        currentStreak = 1;
      }
      localStorage.setItem('signai_streak', currentStreak.toString());
      localStorage.setItem('signai_last_streak_date', today);
      setStreak(currentStreak);
    }

    setShowCelebration(true);
    holdProgressRef.current = 0;
    setHoldProgress(0);
    isMatchingRef.current = false;
    setIsMatching(false);
  };

  const handleLandmarks = useCallback(async (landmarks: number[]) => {
    if (landmarks.length === 0) {
      setCurrentLetter('');
      setConfidence(0);
      if (isMatchingRef.current) {
        isMatchingRef.current = false;
        setIsMatching(false);
        holdProgressRef.current = 0;
        setHoldProgress(0);
      }
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/predict`, { landmarks });
      const { prediction, confidence: conf } = response.data;
      setCurrentLetter(prediction);
      setConfidence(conf * 100);

      const target = activeLetterRef.current;
      const isCorrect = prediction === target && conf >= 0.75;

      if (isCorrect) {
        if (!isMatchingRef.current) {
          isMatchingRef.current = true;
          setIsMatching(true);
        }
        
        if (holdProgressRef.current < 100) {
          holdProgressRef.current = Math.min(100, holdProgressRef.current + 6.7); // Increments to 100 in ~1.5 seconds at 30 FPS
          setHoldProgress(Math.round(holdProgressRef.current));

          if (holdProgressRef.current >= 100) {
            handleMastered(target);
          }
        }
      } else {
        if (isMatchingRef.current) {
          isMatchingRef.current = false;
          setIsMatching(false);
          holdProgressRef.current = 0;
          setHoldProgress(0);
        }
      }
    } catch (error) {
      // Fail silently to avoid UI logs spamming
    }
  }, []);

  const handleNextLetter = () => {
    const currentIndex = ALPHABET.indexOf(activeLetter);
    if (currentIndex < ALPHABET.length - 1) {
      setActiveLetter(ALPHABET[currentIndex + 1]);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('¿Seguro que quieres borrar tu progreso y empezar de nuevo?')) {
      localStorage.removeItem('signai_mastered_letters');
      localStorage.removeItem('signai_streak');
      localStorage.removeItem('signai_last_streak_date');
      setMasteredLetters(new Set());
      setStreak(0);
      setShowCelebration(false);
    }
  };

  // Filter alphabet letters based on search query
  const filteredLetters = ALPHABET.filter(l => 
    l.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGuide = SIGN_GUIDE[activeLetter];
  const isTrained = (stats.labels[activeLetter] || 0) > 0;
  const isLetterMastered = masteredLetters.has(activeLetter);

  return (
    <div className="p-4 lg:p-8 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-gray-900 dark:text-zinc-100 mb-1" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>
            Aprender Señas
          </h1>
          <p className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '13px' }}>
            Practica el abecedario de señas y recibe validaciones instantáneas por IA.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm text-amber-500 font-semibold" style={{ fontSize: '13px' }}>
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>Racha: {streak} días</span>
          </div>
          <button 
            onClick={fetchStats}
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-gray-100 dark:border-zinc-800/80">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(110,211,207,0.12)' }}>
            <Trophy className="w-5 h-5" style={{ color: C.turquoise }} />
          </div>
          <div>
            <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px' }}>Progreso del Abecedario</div>
            <div className="font-bold text-gray-800 dark:text-zinc-100" style={{ fontSize: '16px' }}>{masteredLetters.size} / {ALPHABET.length} dominadas</div>
            <div className="w-32 h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(masteredLetters.size / ALPHABET.length) * 100}%`, background: 'linear-gradient(90deg, #7BCB9D, #6ED3CF)' }} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-gray-100 dark:border-zinc-800/80">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(173,235,179,0.15)' }}>
            <Award className="w-5 h-5" style={{ color: C.mintDark }} />
          </div>
          <div>
            <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px' }}>Seña Seleccionada</div>
            <div className="font-bold text-gray-800 dark:text-zinc-100" style={{ fontSize: '16px' }}>Letra {activeLetter}</div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-semibold ${isLetterMastered ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'}`}>
              {isLetterMastered ? 'Dominada' : 'Pendiente'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-gray-100 dark:border-zinc-800/80">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(100,100,255,0.08)' }}>
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px' }}>Soporte de IA en vivo</div>
            <div className="font-bold text-gray-800 dark:text-zinc-100" style={{ fontSize: '16px' }}>{isTrained ? 'Disponible' : 'Sin Entrenar'}</div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-semibold ${isTrained ? 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'}`}>
              {isTrained ? 'Verificación activa' : 'Requiere dataset'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Sign Grid Selection */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-zinc-800/80 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 dark:text-zinc-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrar abecedario..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border-0 outline-none text-sm bg-[#F5F7F6] dark:bg-zinc-850 text-gray-800 dark:text-zinc-100 placeholder-gray-300 dark:placeholder-zinc-500"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[380px] pr-1 flex-1">
            {filteredLetters.map(l => {
              const mastered = masteredLetters.has(l);
              const active = activeLetter === l;
              const hasData = (stats.labels[l] || 0) > 0;
              
              return (
                <motion.button
                  key={l}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveLetter(l)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all aspect-square relative ${
                    active 
                      ? 'text-white' 
                      : mastered 
                        ? 'text-gray-700 dark:text-zinc-200 bg-green-500/10 dark:bg-green-500/5 border border-green-500/20 dark:border-green-800/30'
                        : 'text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/50 border border-black/5 dark:border-zinc-700/50'
                  }`}
                  style={{
                    background: active ? 'linear-gradient(135deg, #7BCB9D, #6ED3CF)' : undefined,
                  }}
                >
                  <span className="font-bold text-xl">{l}</span>
                  <span className={`text-[8px] mt-1 font-semibold ${active ? 'text-white/80' : hasData ? 'text-indigo-400 dark:text-indigo-300' : 'text-gray-400 dark:text-zinc-500'}`}>
                    {hasData ? 'IA Activa' : 'Manual'}
                  </span>
                  
                  {mastered && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center border border-white">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <button 
            onClick={handleResetProgress}
            className="w-full mt-4 py-2.5 text-xs font-semibold text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all border border-dashed border-gray-100 dark:border-zinc-800"
          >
            Reiniciar progreso de señas
          </button>
        </div>

        {/* Practice Camera & Interactive Guide */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800/80 relative">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-zinc-800/50">
              <div className="flex items-center gap-2">
                <Book className="w-4 h-4" style={{ color: C.mintDark }} />
                <span className="text-gray-700 dark:text-zinc-300" style={{ fontSize: '13px', fontWeight: 600 }}>Cámara de Práctica</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isMatching ? 'bg-green-500 animate-ping' : 'bg-amber-400'}`} />
                <span className="text-gray-500 dark:text-zinc-400" style={{ fontSize: '11px', fontWeight: 500 }}>
                  {isMatching ? 'Validando...' : 'Esperando seña...'}
                </span>
              </div>
            </div>

            {/* Practice view (Webcam container) */}
            <div className="p-4 flex items-center justify-center relative">
              <div className="w-full max-w-[340px] relative rounded-2xl overflow-hidden shadow-sm">
                <HandCamera onLandmarks={handleLandmarks} compact />
                
                {/* Hold circular countdown overlay */}
                {isMatching && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px] z-10 transition-all">
                    <div className="text-center flex flex-col items-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="rgba(255, 255, 255, 0.15)"
                            strokeWidth="5"
                            fill="transparent"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="#ADEBB3"
                            strokeWidth="5"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - holdProgress / 100)}
                            className="transition-all duration-75"
                          />
                        </svg>
                        <span className="text-white font-bold text-lg">{Math.round((1.5 * (100 - holdProgress)) / 100 * 10) / 10}s</span>
                      </div>
                      <p className="text-white text-[11px] font-semibold mt-3 animate-pulse">¡Mantén la posición!</p>
                    </div>
                  </div>
                )}

                {/* Mastered celebration overlay */}
                <AnimatePresence>
                  {showCelebration && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-zinc-900/95 z-20 p-6 text-center"
                    >
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mb-3"
                      >
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </motion.div>
                      <h3 className="font-bold text-gray-800 dark:text-zinc-100 text-lg mb-1">¡Seña "{activeLetter}" Dominada!</h3>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">Has realizado la seña perfectamente por 1.5s.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[200px]">
                        <button
                          onClick={handleNextLetter}
                          className="flex-1 py-2 px-4 rounded-xl text-white font-bold text-xs transition-all hover:shadow-md cursor-pointer"
                          style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)' }}
                        >
                          Siguiente Letra
                        </button>
                        <button
                          onClick={() => setShowCelebration(false)}
                          className="py-2 px-3 text-xs text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                        >
                          Reintentar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* AI confidence stats */}
            {isTrained && !showCelebration && (
              <div className="px-5 pb-4 pt-1 flex items-center justify-between border-t border-gray-50 dark:border-zinc-800/50 text-[11px]">
                <div className="text-gray-400 dark:text-zinc-500">
                  Detección en tiempo real: <span className="font-mono font-bold text-gray-600 dark:text-zinc-300 uppercase">{currentLetter || 'Ninguna'}</span>
                </div>
                <div className="text-gray-400 dark:text-zinc-500 flex items-center gap-1">
                  Confianza: 
                  <span className="font-mono font-bold" style={{ color: confidence >= 75 ? C.mintDark : '#9CA3AF' }}>
                    {confidence.toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Guide & Instruction details */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4.5 h-4.5" style={{ color: C.mintDark }} />
              <h2 className="text-gray-800 dark:text-zinc-200 font-bold text-sm">Instrucciones para la letra "{activeLetter}"</h2>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
              {/* Reference graphics (Dynamic blueprint skeleton or large letter fallback) */}
              {referenceLandmarks ? (
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="relative w-[140px] h-[140px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-800 flex items-center justify-center">
                    {/* Blueprint grid lines */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                      backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                      backgroundSize: '12px 12px'
                    }} />
                    
                    <svg width="140" height="140" className="relative z-10">
                      {SKELETON_CONNECTIONS.map(([a, b], idx) => {
                        const scaled = getScaledPoints(referenceLandmarks, 140, 15);
                        return (
                          <line
                            key={idx}
                            x1={scaled[a]?.x}
                            y1={scaled[a]?.y}
                            x2={scaled[b]?.x}
                            y2={scaled[b]?.y}
                            stroke="#7BCB9D"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        );
                      })}
                      {getScaledPoints(referenceLandmarks, 140, 15).map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r="3"
                          fill={idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20 ? '#6ED3CF' : '#ADEBB3'}
                          stroke="#1e293b"
                          strokeWidth="1"
                        />
                      ))}
                    </svg>
                    <span className="absolute bottom-1.5 right-2 text-[8px] text-slate-500 font-mono">POSE MODEL</span>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">Esqueleto Óseo (IA)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="w-[140px] h-[140px] rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-inner relative"
                    style={{ background: 'linear-gradient(135deg, #ADEBB3, #6ED3CF)' }}
                  >
                    <span className="text-5xl">{activeLetter}</span>
                    <span className="absolute bottom-2 text-[9px] text-white/80 font-bold uppercase tracking-wider">Sin Datos</span>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">Letra Objetivo</span>
                </div>
              )}

              {/* Instructions text */}
              <div className="space-y-3 flex-1">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mr-2 uppercase ${
                    activeGuide.difficulty === 'Fácil' ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' :
                    activeGuide.difficulty === 'Medio' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' : 
                    'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                  }`}>
                    Dificultad: {activeGuide.difficulty}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-medium">Tip: {activeGuide.fingers}</span>
                </div>
                
                <p className="text-gray-600 dark:text-zinc-300 text-xs leading-relaxed" style={{ fontSize: '13px' }}>
                  {activeGuide.desc}
                </p>

                {/* Warning if sign not trained */}
                {!isTrained && (
                  <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 text-[11px] text-amber-800 dark:text-amber-400 leading-normal">
                    <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Validación por IA Desactivada:</strong> Aún no has recolectado datos para la letra "{activeLetter}". Puedes practicarla manualmente guiándote por la descripción, o puedes marcarla manualmente como dominada:
                      <button 
                        onClick={() => handleMastered(activeLetter)}
                        className="block mt-1.5 font-bold underline hover:text-green-700 dark:hover:text-green-400 transition-colors cursor-pointer"
                      >
                        Marcar seña "{activeLetter}" como dominada
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

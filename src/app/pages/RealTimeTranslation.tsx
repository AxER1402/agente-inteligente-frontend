import { useState, useEffect, useCallback, useRef } from 'react';
import { Volume2, Trash2, Copy, Download, Maximize2, Settings2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HandCamera } from '../components/HandCamera';
import axios from 'axios';
import API_URL from '../../config';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

const ASL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function RealTimeTranslation() {
  const [currentLetter, setCurrentLetter] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [translatedText, setTranslatedText] = useState('');
  const [wordBuffer, setWordBuffer] = useState('');
  const [buttonProgress, setButtonProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  // --- Delete button gesture state ---
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);
  const [deleteFlash, setDeleteFlash] = useState(false);

  const isHoveredRef = useRef(false);
  const hoverTimerRef = useRef<any>(null);
  const isDeleteHoveredRef = useRef(false);
  const deleteTimerRef = useRef<any>(null);

  // Ref para controlar la estabilidad de la detección
  const lastLetterRef = useRef('');
  const letterCountRef = useRef(0);
  const STABILITY_THRESHOLD = 15; // Número de frames seguidos para confirmar una letra

  // Ref para controlar el tiempo sin mano
  const noHandCountRef = useRef(0);
  const NO_HAND_THRESHOLD = 30; // ~1-1.5 segundos a 20-30 FPS para autocompletar la palabra

  const addWordToText = useCallback(() => {
    setWordBuffer(prevWord => {
      if (prevWord) {
        setTranslatedText(prevText => prevText + (prevText ? ' ' : '') + prevWord);
      }
      return '';
    });
  }, []);

  const handleLandmarks = useCallback(async (landmarks: number[]) => {
    if (landmarks.length === 0) {
      setCurrentLetter('');
      setConfidence(0);

      // Lógica de espacio al quitar la mano
      noHandCountRef.current += 1;
      if (noHandCountRef.current === NO_HAND_THRESHOLD) {
        addWordToText();
      }
      return;
    }

    // Resetear contador sin mano cuando se vuelve a detectar la mano
    noHandCountRef.current = 0;

    try {
      const response = await axios.post(`${API_URL}/predict`, { landmarks });
      const { prediction, confidence: conf } = response.data;

      setCurrentLetter(prediction);
      setConfidence(conf * 100);

      // Solo procesar para la formación de palabras si tiene al menos 75% de coincidencia (conf >= 0.75)
      if (conf >= 0.75) {
        if (prediction === lastLetterRef.current) {
          letterCountRef.current += 1;
        } else {
          lastLetterRef.current = prediction;
          letterCountRef.current = 1;
        }

        if (letterCountRef.current === STABILITY_THRESHOLD) {
          setWordBuffer(prev => prev + prediction);
        }
      } else {
        // Resetear estabilidad para evitar falsos positivos si baja la confianza
        lastLetterRef.current = '';
        letterCountRef.current = 0;
      }
    } catch (error) {
      console.error("Error al predecir:", error);
    }
  }, [addWordToText]);

  const clearBuffer = () => {
    setWordBuffer('');
  };

  const speakText = useCallback(() => {
    const fullText = translatedText + (wordBuffer ? (translatedText ? ' ' : '') + wordBuffer : '');
    if (!fullText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  }, [translatedText, wordBuffer]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
      if (deleteTimerRef.current) clearInterval(deleteTimerRef.current);
    };
  }, []);

  const handleRawLandmarks = useCallback((rawLms: any[]) => {
    if (rawLms.length === 0) {
      // Reset TTS button
      if (isHoveredRef.current) {
        isHoveredRef.current = false;
        setIsHovered(false);
        setButtonProgress(0);
        if (hoverTimerRef.current) { clearInterval(hoverTimerRef.current); hoverTimerRef.current = null; }
      }
      // Reset delete button
      if (isDeleteHoveredRef.current) {
        isDeleteHoveredRef.current = false;
        setIsDeleteHovered(false);
        setDeleteProgress(0);
        if (deleteTimerRef.current) { clearInterval(deleteTimerRef.current); deleteTimerRef.current = null; }
      }
      return;
    }

    const indexTip = rawLms[8]; // Dedo índice
    if (!indexTip) return;

    // --- Zona TTS: esquina superior izquierda en pantalla = x > 0.75 en coords raw (cámara espejada) ---
    const inTtsZone = indexTip.x > 0.75 && indexTip.y < 0.25;
    // --- Zona Borrar: esquina superior derecha en pantalla = x < 0.25 en coords raw ---
    const inDeleteZone = indexTip.x < 0.25 && indexTip.y < 0.25;

    // -- TTS button logic --
    if (inTtsZone) {
      if (!isHoveredRef.current) {
        isHoveredRef.current = true;
        setIsHovered(true);
        let prog = 0;
        const interval = setInterval(() => {
          prog += 5;
          if (prog >= 100) {
            clearInterval(interval);
            speakText();
            prog = 0;
            setButtonProgress(0);
            isHoveredRef.current = false;
            setIsHovered(false);
          } else {
            setButtonProgress(prog);
          }
        }, 50);
        if (hoverTimerRef.current) clearInterval(hoverTimerRef.current);
        hoverTimerRef.current = interval;
      }
    } else {
      if (isHoveredRef.current) {
        isHoveredRef.current = false;
        setIsHovered(false);
        setButtonProgress(0);
        if (hoverTimerRef.current) { clearInterval(hoverTimerRef.current); hoverTimerRef.current = null; }
      }
    }

    // -- Delete button logic --
    if (inDeleteZone) {
      if (!isDeleteHoveredRef.current) {
        isDeleteHoveredRef.current = true;
        setIsDeleteHovered(true);
        let prog = 0;
        const interval = setInterval(() => {
          prog += 5;
          if (prog >= 100) {
            clearInterval(interval);
            // Borrar frase completa y buffer
            setTranslatedText('');
            setWordBuffer('');
            setDeleteFlash(true);
            setTimeout(() => setDeleteFlash(false), 400);
            prog = 0;
            setDeleteProgress(0);
            isDeleteHoveredRef.current = false;
            setIsDeleteHovered(false);
          } else {
            setDeleteProgress(prog);
          }
        }, 50);
        if (deleteTimerRef.current) clearInterval(deleteTimerRef.current);
        deleteTimerRef.current = interval;
      }
    } else {
      if (isDeleteHoveredRef.current) {
        isDeleteHoveredRef.current = false;
        setIsDeleteHovered(false);
        setDeleteProgress(0);
        if (deleteTimerRef.current) { clearInterval(deleteTimerRef.current); deleteTimerRef.current = null; }
      }
    }
  }, [speakText]);

  const copyToClipboard = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    alert("Texto copiado al portapapeles");
  };

  return (
    <div className="p-4 lg:p-8 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 dark:text-zinc-100" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>
            Traducción en Tiempo Real
          </h1>
          <p className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '13px' }}>Reconocimiento conectado al modelo de Python</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-850 transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
          </button>
          <button className="p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-850 transition-colors">
            <Settings2 className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Camera - wider */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-black/5 dark:border-zinc-800/80">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: currentLetter ? C.mintDark : '#ff4d4d' }} />
              <span className="text-gray-700 dark:text-zinc-300" style={{ fontSize: '13px', fontWeight: 600 }}>
                {currentLetter ? 'Mano Detectada' : 'Buscando Mano...'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px' }}>MediaPipe + RandomForest</span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-center w-full">
            <div className="w-full relative rounded-2xl overflow-hidden shadow-sm">
              <HandCamera onLandmarks={handleLandmarks} onRawLandmarks={handleRawLandmarks} />

              {/* Flash de borrado */}
              {deleteFlash && (
                <div className="absolute inset-0 bg-red-500/20 z-30 pointer-events-none rounded-2xl" />
              )}

              {/* Botón gestual TTS — esquina superior IZQUIERDA en pantalla */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <button
                  onClick={speakText}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 border cursor-pointer focus:outline-none ${isHovered
                      ? 'bg-green-500/30 border-green-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-black/45 border-white/20 hover:bg-black/60 shadow-lg'
                    }`}
                >
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="2.5" fill="transparent" />
                    <circle cx="24" cy="24" r="20" stroke="#ADEBB3" strokeWidth="2.5" fill="transparent"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - buttonProgress / 100)}
                      className="transition-all duration-75"
                    />
                  </svg>
                  <Volume2 className={`w-5 h-5 transition-transform ${isHovered ? 'scale-110 text-[#ADEBB3]' : 'text-white'}`} />
                </button>
                {isHovered && (
                  <span className="text-white text-[10px] font-bold bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                    Leyendo...
                  </span>
                )}
              </div>

              {/* Botón gestual BORRAR — esquina superior DERECHA en pantalla */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                {isDeleteHovered && (
                  <span className="text-red-300 text-[10px] font-bold bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                    Borrando...
                  </span>
                )}
                <button
                  onClick={() => { setTranslatedText(''); setWordBuffer(''); }}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 border cursor-pointer focus:outline-none ${isDeleteHovered
                      ? 'bg-red-500/30 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'bg-black/45 border-white/20 hover:bg-black/60 shadow-lg'
                    }`}
                >
                  {/* SVG progress ring rojo */}
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" fill="transparent" />
                    <circle cx="24" cy="24" r="20" stroke="#f87171" strokeWidth="2.5" fill="transparent"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - deleteProgress / 100)}
                      className="transition-all duration-75"
                    />
                  </svg>
                  <Trash2 className={`w-5 h-5 transition-transform ${isDeleteHovered ? 'scale-110 text-red-400' : 'text-white'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">

          {/* Detected letter */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-zinc-800/80">
            <div className="text-gray-400 dark:text-zinc-500 mb-3" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em' }}>LETRA ACTUAL</div>
            <div className="flex items-center justify-between mb-3">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={currentLetter || 'none'}
                  initial={{ scale: 0.6, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="font-bold text-[#1A3A2A] dark:text-[#ADEBB3]"
                  style={{ fontSize: '80px', lineHeight: 1, letterSpacing: '-0.04em' }}>
                  {currentLetter || '?'}
                </motion.div>
              </AnimatePresence>
              <div className="text-right">
                <div className="font-bold" style={{ fontSize: '22px', color: C.mintDark, letterSpacing: '-0.02em' }}>
                  {confidence.toFixed(1)}%
                </div>
                <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px' }}>confianza</div>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-green-100/30 dark:bg-green-950/20">
              <motion.div className="h-full rounded-full"
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 0.3 }}
                style={{ background: 'linear-gradient(90deg, #ADEBB3, #6ED3CF)' }} />
            </div>
          </div>

          {/* Word buffer */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em' }}>PALABRA EN CURSO</span>
                {!currentLetter && wordBuffer && (
                  <span className="text-[#7BCB9D] animate-pulse text-[9px] font-bold">
                    (Quita la mano para confirmar)
                  </span>
                )}
              </div>
              <button onClick={clearBuffer} className="text-[10px] text-red-400 font-bold hover:underline">LIMPIAR</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4 min-h-[40px]">
              {wordBuffer.split('').map((ch, i) => (
                <motion.div
                  key={`${ch}-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${i === wordBuffer.length - 1 ? 'text-white' : 'text-gray-700 dark:text-zinc-200 bg-green-500/10 dark:bg-[#ADEBB3]/10'
                    }`}
                  style={{
                    background: i === wordBuffer.length - 1
                      ? 'linear-gradient(135deg, #ADEBB3, #6ED3CF)' : undefined,
                    fontSize: '16px',
                  }}>
                  {ch}
                </motion.div>
              ))}
            </div>
            <button
              onClick={addWordToText}
              disabled={!wordBuffer}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)' }}>
              AÑADIR A FRASE
            </button>
          </div>

          {/* Full text */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm flex-1 border border-black/5 dark:border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em' }}>FRASE TRADUCIDA</div>
              <div className="flex gap-1">
                <button onClick={copyToClipboard} className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer" title="Copiar al portapapeles"><Copy className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" /></button>
                <button onClick={() => setTranslatedText('')} className="p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer" title="Borrar frase"><Trash2 className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" /></button>
              </div>
            </div>
            <div className="text-gray-800 dark:text-zinc-200 mb-4 min-h-[60px]" style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '-0.01em' }}>
              {translatedText ? `"${translatedText}"` : <span className="text-gray-200 dark:text-zinc-700">La frase aparecerá aquí...</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={speakText}
                disabled={!translatedText}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white transition-all flex-1 justify-center disabled:opacity-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)', fontSize: '13px', fontWeight: 600 }}>
                <Volume2 className="w-4.5 h-4.5" />
                Escuchar Frase (Voz)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

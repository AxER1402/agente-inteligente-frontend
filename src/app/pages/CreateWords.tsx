import { useState } from 'react';
import { Type, Volume2, Trash2, Plus, X, ArrowRight, Wand2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const COMMON_PHRASES = [
  'HOLA', 'GRACIAS', 'POR FAVOR', 'BUENOS DIAS', 'COMO ESTAS', 'HASTA LUEGO', 'AYUDA', 'SÍ', 'NO',
];

const savedWords = [
  { word: 'HOLA', meaning: 'Saludo estándar', uses: 47 },
  { word: 'GRACIAS', meaning: 'Expresión de agradecimiento', uses: 31 },
  { word: 'AYUDA', meaning: 'Solicitar asistencia', uses: 28 },
  { word: 'BIEN', meaning: 'Estado positivo', uses: 22 },
];

export function CreateWords() {
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [history, setHistory] = useState(['Hola, ¿cómo estás?', 'Gracias por tu ayuda', 'Buenos días']);
  const [speaking, setSpeaking] = useState(false);

  const addLetter = (l: string) => setCurrentWord(w => [...w, l]);
  const removeLetter = () => setCurrentWord(w => w.slice(0, -1));
  const clearWord = () => setCurrentWord([]);
  const addPhrase = (phrase: string) => setCurrentWord(phrase.split(''));

  const speak = () => {
    setSpeaking(true);
    setTimeout(() => setSpeaking(false), 2000);
  };

  const saveToHistory = () => {
    const word = currentWord.join('');
    if (word) {
      setHistory(h => [word.charAt(0) + word.slice(1).toLowerCase(), ...h.slice(0, 4)]);
      setCurrentWord([]);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>Crear Palabras</h1>
        <p className="text-gray-400" style={{ fontSize: '13px' }}>Constructor interactivo de frases con síntesis de voz</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Letter keyboard */}
        <div className="lg:col-span-2 space-y-5">

          {/* Word display */}
          <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>Palabra actual</div>
              <div className="flex gap-2">
                <button onClick={removeLetter} className="p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={clearWord} className="p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="min-h-16 flex flex-wrap gap-2 items-center mb-5 p-4 rounded-2xl"
              style={{ background: C.lightGray }}>
              <AnimatePresence>
                {currentWord.length === 0 ? (
                  <span className="text-gray-300" style={{ fontSize: '15px' }}>Toca las letras para construir una palabra...</span>
                ) : (
                  currentWord.map((l, i) => (
                    <motion.div
                      key={`${l}-${i}`}
                      initial={{ scale: 0, opacity: 0, y: -10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold"
                      style={{
                        background: i === currentWord.length - 1
                          ? 'linear-gradient(135deg, #ADEBB3, #6ED3CF)' : 'white',
                        color: i === currentWord.length - 1 ? '#fff' : '#1A3A2A',
                        fontSize: '18px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}>
                      {l}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-3">
              <button
                onClick={speak}
                disabled={currentWord.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white transition-all disabled:opacity-40"
                style={{ background: speaking ? 'linear-gradient(135deg, #6ED3CF, #7BCB9D)' : 'linear-gradient(135deg, #7BCB9D, #6ED3CF)', fontSize: '13px', fontWeight: 500 }}>
                <Volume2 className={`w-4 h-4 ${speaking ? 'animate-pulse' : ''}`} />
                {speaking ? 'Hablando...' : 'Hablar'}
              </button>
              <button
                onClick={saveToHistory}
                disabled={currentWord.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all disabled:opacity-40"
                style={{ background: 'rgba(173,235,179,0.12)', color: C.mintDark, fontSize: '13px', fontWeight: 500, border: '1px solid rgba(173,235,179,0.3)' }}>
                <Plus className="w-4 h-4" /> Guardar
              </button>
            </div>
          </div>

          {/* Keyboard */}
          <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-gray-600 mb-4" style={{ fontSize: '13px', fontWeight: 500 }}>Teclado de Señas</div>
            <div className="grid grid-cols-9 gap-1.5">
              {ALPHABET.map(letter => (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => addLetter(letter)}
                  className="aspect-square rounded-xl flex items-center justify-center font-bold transition-all"
                  style={{
                    background: currentWord[currentWord.length - 1] === letter
                      ? 'linear-gradient(135deg, #ADEBB3, #6ED3CF)' : 'rgba(173,235,179,0.08)',
                    color: currentWord[currentWord.length - 1] === letter ? '#fff' : '#374151',
                    fontSize: '14px',
                    border: '1px solid rgba(173,235,179,0.2)',
                  }}>
                  {letter}
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => addLetter(' ')}
                className="col-span-3 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: 'rgba(220,232,242,0.3)',
                  color: '#6B7280', fontSize: '12px', fontWeight: 500,
                  border: '1px solid rgba(220,232,242,0.5)',
                  padding: '8px',
                }}>
                ESPACIO
              </motion.button>
            </div>
          </div>

          {/* Quick phrases */}
          <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-gray-600 mb-3" style={{ fontSize: '13px', fontWeight: 500 }}>Frases Rápidas</div>
            <div className="flex flex-wrap gap-2">
              {COMMON_PHRASES.map(phrase => (
                <motion.button
                  key={phrase}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addPhrase(phrase)}
                  className="px-3 py-1.5 rounded-xl transition-all"
                  style={{
                    background: 'rgba(173,235,179,0.1)', color: '#374151',
                    fontSize: '12px', fontWeight: 500, border: '1px solid rgba(173,235,179,0.25)',
                  }}>
                  {phrase}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">

          {/* Voice preview */}
          <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Wand2 className="w-4 h-4" style={{ color: C.mintDark }} />
              <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>Síntesis de Voz</span>
            </div>
            <div className="text-gray-400 text-center py-6 flex flex-col items-center gap-3">
              <div className="flex gap-1 items-end h-8">
                {[4, 7, 12, 5, 9, 14, 6, 10, 8].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={speaking ? { height: [h, h * 2, h] } : { height: h }}
                    transition={{ duration: 0.5, delay: i * 0.06, repeat: speaking ? Infinity : 0 }}
                    className="w-1.5 rounded-full"
                    style={{ background: speaking ? 'linear-gradient(180deg, #6ED3CF, #ADEBB3)' : '#E5E7EB', height: h }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '12px', color: speaking ? C.mintDark : '#9CA3AF' }}>
                {speaking ? 'Reproduciendo...' : 'Listo para hablar'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500" style={{ fontSize: '12px' }}>Velocidad</span>
                <span style={{ fontSize: '12px', color: C.mintDark, fontWeight: 500 }}>1.0x</span>
              </div>
              <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full accent-green-400" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500" style={{ fontSize: '12px' }}>Idioma</span>
                <span style={{ fontSize: '12px', color: C.mintDark, fontWeight: 500 }}>Español</span>
              </div>
            </div>
          </div>

          {/* Saved words */}
          <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-gray-600 mb-3" style={{ fontSize: '13px', fontWeight: 500 }}>Palabras Guardadas</div>
            <div className="space-y-2">
              {savedWords.map(({ word, meaning, uses }) => (
                <div key={word}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setCurrentWord(word.split(''))}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(173,235,179,0.12)', color: '#1A3A2A', fontSize: '13px', fontWeight: 700 }}>
                    {word[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800" style={{ fontSize: '13px' }}>{word}</div>
                    <div className="text-gray-400 truncate" style={{ fontSize: '11px' }}>{meaning}</div>
                  </div>
                  <div className="text-gray-300" style={{ fontSize: '11px' }}>{uses}×</div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="text-gray-600 mb-3" style={{ fontSize: '13px', fontWeight: 500 }}>Historial Reciente</div>
            <div className="space-y-1.5">
              {history.map((item, i) => (
                <div key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setCurrentWord(item.toUpperCase().split(''))}>
                  <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: C.mintDark }} />
                  <span className="text-gray-600 text-sm truncate" style={{ fontSize: '12px' }}>{item}</span>
                  <button className="ml-auto p-1 rounded-lg hover:bg-gray-100" onClick={e => { e.stopPropagation(); }}>
                    <Copy className="w-3 h-3 text-gray-300" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { Database, Camera, Plus, Search, Download, Trash2, CheckCircle, Clock, Filter, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { HandCamera } from '../components/HandCamera';
import axios from 'axios';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

export function CollectDataset() {
  const [activeSign, setActiveSign] = useState('A');
  const [capturing, setCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<{total_samples: number, labels: Record<string, number>}>({ total_samples: 0, labels: {} });
  const [targetSamples] = useState(100);

  const [burstSize, setBurstSize] = useState(500);
  const burstSizeRef = useRef(500);

  const activeSignRef = useRef(activeSign);
  const capturingRef = useRef(capturing);
  const captureCountRef = useRef(0);

  // Sincronizar referencias para evitar recrear handleLandmarks en cada frame
  useEffect(() => {
    activeSignRef.current = activeSign;
  }, [activeSign]);

  useEffect(() => {
    capturingRef.current = capturing;
  }, [capturing]);

  useEffect(() => {
    burstSizeRef.current = burstSize;
  }, [burstSize]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLandmarks = useCallback(async (landmarks: number[]) => {
    if (!capturingRef.current || landmarks.length === 0) return;

    try {
      await axios.post('http://localhost:8000/collect', {
        label: activeSignRef.current,
        landmarks: landmarks
      });
      
      captureCountRef.current += 1;
      setCaptureCount(captureCountRef.current);
      
      // Detener captura si llegamos al límite de la ráfaga
      if (captureCountRef.current >= burstSizeRef.current) {
        capturingRef.current = false;
        setCapturing(false);
        fetchStats();
      }
    } catch (error) {
      console.error("Error collecting sample:", error);
      capturingRef.current = false;
      setCapturing(false);
    }
  }, []); // handleLandmarks es completamente estable ahora

  const startCapture = () => {
    captureCountRef.current = 0;
    setCaptureCount(0);
    capturingRef.current = true;
    setCapturing(true);
  };

  const deleteSamples = async () => {
    if (window.confirm(`¿Estás seguro de que deseas borrar todas las muestras de la letra "${activeSign}"? Esto no se puede deshacer.`)) {
      try {
        const response = await axios.post('http://localhost:8000/delete', {
          label: activeSign
        });
        alert(response.data.message);
        fetchStats();
      } catch (error) {
        console.error("Error al borrar muestras:", error);
        alert("Ocurrió un error al intentar borrar las muestras.");
      }
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const filtered = alphabet.filter(l => l.includes(searchQuery.toUpperCase()));

  return (
    <div className="p-4 lg:p-8 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 dark:text-zinc-100 mb-1" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>Recolectar Dataset</h1>
          <p className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '13px' }}>Captura real de puntos MediaPipe para tu dataset CSV</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchStats}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-zinc-800 border border-black/5 dark:border-zinc-800/80 transition-all cursor-pointer">
            <RefreshCw className="w-4 h-4 text-gray-400 dark:text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Muestras', value: stats.total_samples.toLocaleString(), sub: 'En dataset.csv' },
          { label: 'Señas con datos', value: Object.keys(stats.labels).length, sub: 'De 26 posibles' },
          { label: 'Muestras de actual', value: stats.labels[activeSign] || 0, sub: `Etiqueta ${activeSign}` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-black/5 dark:border-zinc-800/80">
            <div className="font-bold text-gray-900 dark:text-zinc-100 mb-0.5" style={{ fontSize: '20px', letterSpacing: '-0.02em' }}>{value}</div>
            <div className="text-gray-600 dark:text-zinc-400" style={{ fontSize: '12px', fontWeight: 500 }}>{label}</div>
            <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Sign grid */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 dark:text-zinc-500" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar letra..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border-0 outline-none text-sm bg-[#F5F7F6] dark:bg-zinc-850 text-gray-800 dark:text-zinc-100 placeholder-gray-300 dark:placeholder-zinc-500"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-1">
            {filtered.map(l => {
              const count = stats.labels[l] || 0;
              const isComplete = count >= targetSamples;
              const isActive = activeSign === l;
              
              return (
                <motion.div
                  key={l}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveSign(l)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all aspect-square relative ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/50 border border-black/5 dark:border-zinc-700/50 hover:bg-gray-50 dark:hover:bg-zinc-800'
                  }`}
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #ADEBB3, #6ED3CF)' : undefined,
                  }}>
                  <span className="font-bold text-lg">{l}</span>
                  <span className={`text-[9px] ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-zinc-500'}`}>{count} samples</span>
                  {isComplete && !isActive && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Capture panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-black/5 dark:border-zinc-800/80">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ADEBB3, #6ED3CF)', fontSize: '16px' }}>
                  {activeSign}
                </div>
                <div>
                  <div className="text-gray-800 dark:text-zinc-200" style={{ fontSize: '13px', fontWeight: 600 }}>Capturando "{activeSign}"</div>
                  <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px' }}>Posiciona tu mano en la cámara</div>
                </div>
              </div>
              {capturing && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 dark:bg-green-500/5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.mintDark }} />
                  <span className="text-[#1A3A2A] dark:text-[#ADEBB3]" style={{ fontSize: '11px', fontWeight: 500 }}>Guardando: {captureCount}/{burstSize}</span>
                </div>
              )}
            </div>
            <div className="p-4 flex items-center justify-center">
              <HandCamera onLandmarks={handleLandmarks} compact />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-zinc-800/80">
            <div className="text-gray-700 dark:text-zinc-200 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Acciones de Captura</div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-[11px] text-gray-400 dark:text-zinc-500 font-bold mb-1.5 uppercase">Tamaño de la Ráfaga</label>
                <select 
                  value={burstSize} 
                  onChange={e => setBurstSize(Number(e.target.value))}
                  disabled={capturing}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 outline-none text-sm bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-medium"
                  style={{ fontSize: '13px' }}
                >
                  <option value={25}>25 muestras (Rápida)</option>
                  <option value={100}>100 muestras (Mediana)</option>
                  <option value={500}>500 muestras (Recomendado para precisión)</option>
                  <option value={1000}>1000 muestras (Ultra precisión)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startCapture}
                disabled={capturing}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white flex-1 justify-center transition-all disabled:opacity-60 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)', fontSize: '14px', fontWeight: 500 }}>
                <Camera className="w-4 h-4" />
                {capturing ? 'Capturando...' : `Iniciar Ráfaga de ${burstSize}`}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={deleteSamples}
                disabled={capturing}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-red-500 dark:text-red-400 justify-center transition-all border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-60 cursor-pointer"
                style={{ fontSize: '14px', fontWeight: 500 }}>
                <Trash2 className="w-4 h-4" />
                Borrar Letra
              </motion.button>
            </div>

            <div className="mt-4 p-3 rounded-2xl bg-[#F5F7F6] dark:bg-zinc-850 text-gray-500 dark:text-zinc-400">
              <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400" style={{ fontSize: '12px' }}>
                <Clock className="w-3.5 h-3.5" />
                <span>Cada muestra guarda 63 coordenadas (x,y,z) normalizadas en el CSV.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

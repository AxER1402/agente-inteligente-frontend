import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2, Trash2, Save, Camera, Activity, Zap, Database,
  TrendingUp, RefreshCw, Play, Pause,
  CheckCircle, ArrowRight, Sparkles, Wand2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { HandCamera } from '../components/HandCamera';
import axios from 'axios';
import { Link } from 'react-router';
import API_URL from '../../config';

const C = {
  mint: '#ADEBB3',
  mintDark: '#7BCB9D',
  turquoise: '#6ED3CF',
  blueGray: '#DCE8F2',
  lightGray: '#F5F7F6',
};

export function Dashboard() {
  const [cameraActive, setCameraActive] = useState(true);
  const [currentLetter, setCurrentLetter] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [stats, setStats] = useState({ total_samples: 0, labels: {} });

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const wristHistoryRef = useRef<{x: number, y: number}[]>([]);

  const handleRawLandmarks = useCallback((rawLms: any[]) => {
    if (rawLms.length === 0) {
      wristHistoryRef.current = [];
      return;
    }
    const wrist = rawLms[0];
    if (wrist) {
      wristHistoryRef.current.push({ x: wrist.x, y: wrist.y });
      if (wristHistoryRef.current.length > 20) {
        wristHistoryRef.current.shift();
      }
    }
  }, []);

  const handleLandmarks = useCallback(async (landmarks: number[]) => {
    if (!cameraActive || landmarks.length === 0) {
      setCurrentLetter('');
      setConfidence(0);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/predict`, { landmarks });
      let { prediction, confidence } = response.data;

      // --- APLICAR HEURÍSTICA DE MOVIMIENTO ---
      const history = wristHistoryRef.current;
      if (history.length >= 15) {
        const start = history[0];
        const end = history[history.length - 1];
        
        const dy = end.y - start.y;
        const dx = end.x - start.x;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const xs = history.map(p => p.x);
        const max_x = Math.max(...xs);
        const min_x = Math.min(...xs);

        if (prediction === 'I' || prediction === 'J') {
          if (dy > 0.08 && dist > 0.1) prediction = 'J';
          else prediction = 'I';
        } else if (prediction === 'D' || prediction === 'Z') {
          if (dist > 0.15) prediction = 'Z';
          else prediction = 'D';
        } else if (prediction === 'X' || prediction === 'Q') {
          if (dy > 0.05) prediction = 'X';
        } else if (prediction === 'N' || prediction === 'Ñ') {
          if ((max_x - min_x) > 0.06) prediction = 'Ñ';
          else prediction = 'N';
        }
      }

      setCurrentLetter(prediction);
      setConfidence(confidence * 100);
    } catch (error) {
      // Silently fail to avoid console spam in dashboard
    }
  }, [cameraActive]);

  return (
    <div className="p-4 lg:p-8 space-y-6 min-h-full" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 border border-green-500/20 dark:border-green-800/30"
        style={{ background: 'linear-gradient(135deg, rgba(173,235,179,0.18) 0%, rgba(110,211,207,0.12) 50%, rgba(220,232,242,0.2) 100%)' }}>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: 'rgba(173,235,179,0.2)', border: '1px solid rgba(173,235,179,0.4)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: C.mintDark }} />
            <span className="text-[#1A3A2A] dark:text-[#ADEBB3]" style={{ fontSize: '12px', fontWeight: 500 }}>
              Proyecto SignAI · Python + React
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-zinc-100 mb-3"
            style={{ lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            Traductor de Señas<br />
            <span style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Inteligencia Artificial
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-500 dark:text-zinc-400 mb-6"
            style={{ fontSize: '15px', lineHeight: 1.6 }}>
            Sistema de reconocimiento de gestos basado en puntos 3D de MediaPipe y clasificación con Scikit-Learn.
          </motion.p>

          <div className="flex flex-wrap gap-3">
            <Link to="/traduccion"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)', fontSize: '14px', fontWeight: 600 }}>
              Abrir Traductor <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/dataset"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 border border-black/5 dark:border-zinc-700/50"
              style={{ fontSize: '14px', fontWeight: 600 }}>
              Recolectar Datos
            </Link>
          </div>
        </div>
      </div>

      {/* Main grid: Camera + Translation */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Camera Card */}
        <div className="xl:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-black/5 dark:border-zinc-800/80">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-zinc-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(173,235,179,0.15)' }}>
                <Camera className="w-4 h-4" style={{ color: C.mintDark }} />
              </div>
              <div>
                <div className="text-gray-800 dark:text-zinc-200" style={{ fontSize: '14px', fontWeight: 600 }}>Vista Previa</div>
                <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '11px' }}>Detección de puntos en tiempo real</div>
              </div>
            </div>
          </div>
          <div className="p-4 flex items-center justify-center">
            <div className="w-full rounded-2xl overflow-hidden">
              {cameraActive ? <HandCamera onLandmarks={handleLandmarks} onRawLandmarks={handleRawLandmarks} /> : (
                 <div className="w-full aspect-square flex items-center justify-center bg-black text-white font-bold rounded-2xl">Cámara Pausada</div>
              )}
            </div>
          </div>
        </div>

        {/* Prediction info */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm flex-1 border border-black/5 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 mb-6">
              <Wand2 className="w-4 h-4" style={{ color: C.mintDark }} />
              <span className="text-gray-600 dark:text-zinc-400" style={{ fontSize: '13px', fontWeight: 500 }}>Predicción Actual</span>
            </div>

            <div className="flex flex-col items-center justify-center py-10 rounded-3xl mb-6 bg-green-50/50 dark:bg-green-950/10">
              <motion.div
                key={currentLetter}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-bold text-[#1A3A2A] dark:text-[#ADEBB3]"
                style={{ fontSize: '100px', lineHeight: 1 }}>
                {currentLetter || '?'}
              </motion.div>
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-zinc-850/50 border border-white/80 dark:border-zinc-700/30">
                 <div className="w-2 h-2 rounded-full" style={{ background: C.mintDark }} />
                 <span className="font-bold text-sm" style={{ color: C.mintDark }}>{confidence.toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/80">
                    <div className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-bold mb-1">Total Muestras</div>
                    <div className="text-xl font-bold text-gray-800 dark:text-zinc-100">{stats.total_samples}</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/80">
                    <div className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase font-bold mb-1">Señas</div>
                    <div className="text-xl font-bold text-gray-800 dark:text-zinc-100">{Object.keys(stats.labels).length}</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
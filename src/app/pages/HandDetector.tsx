import { useState, useEffect } from 'react';
import { Eye, Target, Layers, Activity, Info, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { HandCamera } from '../components/HandCamera';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

const LANDMARK_NAMES = [
  'Muñeca', 'CMC Pulgar', 'MCP Pulgar', 'IP Pulgar', 'Punta Pulgar',
  'MCP Índice', 'PIP Índice', 'DIP Índice', 'Punta Índice',
  'MCP Medio', 'PIP Medio', 'DIP Medio', 'Punta Medio',
  'MCP Anular', 'PIP Anular', 'DIP Anular', 'Punta Anular',
  'MCP Meñique', 'PIP Meñique', 'DIP Meñique', 'Punta Meñique',
];

const fingerMetrics = [
  { name: 'Pulgar', extended: true, angle: 42, confidence: 98.1 },
  { name: 'Índice', extended: true, angle: 87, confidence: 97.4 },
  { name: 'Medio', extended: true, angle: 91, confidence: 96.8 },
  { name: 'Anular', extended: false, angle: 12, confidence: 99.2 },
  { name: 'Meñique', extended: false, angle: 8, confidence: 98.7 },
];

export function HandDetector() {
  const [fps, setFps] = useState(30);
  const [detectionTime, setDetectionTime] = useState(12.3);
  const [handedness, setHandedness] = useState('Derecha');

  useEffect(() => {
    const t = setInterval(() => {
      setFps(28 + Math.floor(Math.random() * 4));
      setDetectionTime(10 + Math.random() * 5);
    }, 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-4 lg:p-8 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>Detector de Mano</h1>
          <p className="text-gray-400" style={{ fontSize: '13px' }}>MediaPipe Hands · 21 landmarks · Detección en tiempo real</p>
        </div>
        <button className="p-2 rounded-xl hover:bg-white transition-colors">
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'FPS', value: fps, icon: Activity, color: C.mintDark },
          { label: 'Detección (ms)', value: detectionTime.toFixed(1), icon: Target, color: C.turquoise },
          { label: 'Landmarks', value: '21', icon: Layers, color: '#7BCB9D' },
          { label: 'Mano', value: handedness, icon: Eye, color: '#DCE8F2' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: `${color}22` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="font-bold text-gray-900" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>{value}</div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Camera */}
        <div className="xl:col-span-3 bg-white rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.mintDark }} />
            <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 600 }}>Visualización de Landmarks</span>
          </div>
          <div className="p-4 flex items-center justify-center">
            <HandCamera />
          </div>
        </div>

        {/* Finger metrics */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: C.mintDark }} />
              <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>Análisis por Dedo</span>
            </div>
            <div className="space-y-3">
              {fingerMetrics.map(({ name, extended, angle, confidence }) => (
                <div key={name} className="p-3 rounded-2xl" style={{ background: C.lightGray }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: extended ? C.mintDark : '#E5E7EB' }} />
                      <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>{name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400" style={{ fontSize: '11px' }}>{angle}°</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: extended ? 'rgba(173,235,179,0.2)' : 'rgba(0,0,0,0.05)',
                          color: extended ? '#1A3A2A' : '#6B7280',
                          fontSize: '10px',
                        }}>
                        {extended ? 'Extendido' : 'Flexionado'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(173,235,179,0.15)' }}>
                      <div className="h-full rounded-full" style={{ width: `${confidence}%`, background: 'linear-gradient(90deg, #ADEBB3, #6ED3CF)' }} />
                    </div>
                    <span style={{ fontSize: '10px', color: C.mintDark, fontWeight: 500 }}>{confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Landmark coords */}
          <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4" style={{ color: C.mintDark }} />
              <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>Coordenadas (muestra)</span>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {LANDMARK_NAMES.slice(0, 8).map((name, i) => (
                <div key={name} className="flex items-center justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500" style={{ fontSize: '11px' }}>
                    <span className="inline-block w-4 text-gray-300">{i}</span> {name}
                  </span>
                  <span className="font-mono" style={{ fontSize: '10px', color: C.mintDark }}>
                    ({(0.3 + Math.random() * 0.4).toFixed(3)}, {(0.3 + Math.random() * 0.5).toFixed(3)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

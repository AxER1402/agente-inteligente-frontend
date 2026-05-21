import { useState, useEffect } from 'react';
import { Target, Zap, Activity, RefreshCw, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HandCamera } from '../components/HandCamera';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

const ALL_SIGNS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function generatePredictions(topSign: string) {
  const rest = ALL_SIGNS.filter(s => s !== topSign).sort(() => Math.random() - 0.5).slice(0, 4);
  const topConf = 88 + Math.random() * 10;
  let remaining = 100 - topConf;
  const others = rest.map((s, i) => {
    const val = i < 3 ? (remaining * (0.5 - i * 0.12)) : Math.max(0.5, remaining * 0.1);
    remaining -= val;
    return { sign: s, confidence: Math.max(0.5, val) };
  });
  return [{ sign: topSign, confidence: topConf }, ...others].sort((a, b) => b.confidence - a.confidence);
}

export function Predictions() {
  const [predictions, setPredictions] = useState(() => generatePredictions('H'));
  const [topSign, setTopSign] = useState('H');
  const [totalPredictions, setTotalPredictions] = useState(2847);
  const [sessionAccuracy, setSessionAccuracy] = useState(97.3);

  useEffect(() => {
    const signs = ['H', 'O', 'L', 'A', 'B', 'Y', 'C', 'M', 'E'];
    const t = setInterval(() => {
      const newSign = signs[Math.floor(Date.now() / 2000) % signs.length];
      setTopSign(newSign);
      setPredictions(generatePredictions(newSign));
      setTotalPredictions(p => p + 1);
      setSessionAccuracy(94 + Math.random() * 5);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const chartData = predictions.map(p => ({
    name: p.sign,
    value: Number(p.confidence.toFixed(2)),
  }));

  return (
    <div className="p-4 lg:p-8 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>Predicciones</h1>
        <p className="text-gray-400" style={{ fontSize: '13px' }}>Clasificación en tiempo real con top-5 predicciones</p>
      </div>

      {/* Session stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Predicciones Hoy', value: totalPredictions.toLocaleString(), icon: Activity, color: C.mintDark },
          { label: 'Precisión Sesión', value: `${sessionAccuracy.toFixed(1)}%`, icon: TrendingUp, color: C.turquoise },
          { label: 'Mejor Precisión', value: '99.1%', icon: Award, color: '#7BCB9D' },
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
        <div className="xl:col-span-2 bg-white rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: C.mintDark }} />
            <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 600 }}>Cámara en Tiempo Real</span>
          </div>
          <div className="p-4 flex items-center justify-center">
            <HandCamera compact />
          </div>
        </div>

        {/* Top prediction */}
        <div className="xl:col-span-1 bg-white rounded-3xl p-5 shadow-sm flex flex-col items-center justify-center"
          style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="text-gray-400 mb-4" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }}>
            PREDICCIÓN PRINCIPAL
          </div>

          <div className="relative">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={topSign}
                initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
                animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                exit={{ scale: 1.3, opacity: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                className="w-32 h-32 rounded-3xl flex items-center justify-center font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(173,235,179,0.2), rgba(110,211,207,0.15))',
                  border: '2px solid rgba(173,235,179,0.4)',
                  fontSize: '64px', color: '#1A3A2A',
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                {topSign}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 text-center">
            <div className="font-bold" style={{ fontSize: '22px', color: C.mintDark, letterSpacing: '-0.02em' }}>
              {predictions[0]?.confidence.toFixed(1)}%
            </div>
            <div className="text-gray-400" style={{ fontSize: '12px' }}>confianza</div>
          </div>

          <div className="w-full mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(173,235,179,0.12)' }}>
            <motion.div
              animate={{ width: `${predictions[0]?.confidence ?? 0}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #ADEBB3, #6ED3CF)' }} />
          </div>
        </div>

        {/* Bar chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4" style={{ color: C.mintDark }} />
            <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>Top 5 Candidatos</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: '#374151' }} width={25} />
              <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Confianza']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={index === 0 ? C.mintDark : index === 1 ? C.turquoise : `rgba(173,235,179,${0.4 - index * 0.05})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full predictions list */}
      <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: C.mintDark }} />
            <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>Distribución de Confianza</span>
          </div>
          <button className="p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-3">
          {predictions.map(({ sign, confidence }, i) => (
            <div key={sign} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
                style={{
                  background: i === 0 ? 'linear-gradient(135deg, #ADEBB3, #6ED3CF)' : `rgba(173,235,179,${0.12 - i * 0.02})`,
                  color: i === 0 ? '#fff' : '#374151',
                  fontSize: '14px',
                }}>
                {sign}
              </div>
              <div className="flex-1">
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(173,235,179,0.1)' }}>
                  <motion.div
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: i === 0 ? 'linear-gradient(90deg, #ADEBB3, #6ED3CF)' :
                        i === 1 ? C.turquoise : `rgba(173,235,179,${0.5 - i * 0.08})`,
                    }} />
                </div>
              </div>
              <div className="w-14 text-right font-mono font-bold" style={{ fontSize: '13px', color: i === 0 ? C.mintDark : '#9CA3AF' }}>
                {confidence.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

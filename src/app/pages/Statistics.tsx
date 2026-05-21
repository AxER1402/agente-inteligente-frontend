import { BarChart2, TrendingUp, Users, Clock, Download, Calendar } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { motion } from 'motion/react';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

const weeklyData = [
  { day: 'Lun', sessions: 12, signs: 1240, accuracy: 96.2 },
  { day: 'Mar', sessions: 18, signs: 1980, accuracy: 97.1 },
  { day: 'Mié', sessions: 15, signs: 1650, accuracy: 96.8 },
  { day: 'Jue', sessions: 22, signs: 2300, accuracy: 97.4 },
  { day: 'Vie', sessions: 19, signs: 2100, accuracy: 97.8 },
  { day: 'Sáb', sessions: 8, signs: 920, accuracy: 97.2 },
  { day: 'Dom', sessions: 5, signs: 580, accuracy: 96.5 },
];

const accuracyHistory = [
  { month: 'Ene', accuracy: 78.2 }, { month: 'Feb', accuracy: 83.4 },
  { month: 'Mar', accuracy: 87.1 }, { month: 'Abr', accuracy: 90.5 },
  { month: 'May', accuracy: 93.2 }, { month: 'Jun', accuracy: 94.8 },
  { month: 'Jul', accuracy: 95.6 }, { month: 'Ago', accuracy: 96.3 },
  { month: 'Sep', accuracy: 96.9 }, { month: 'Oct', accuracy: 97.1 },
  { month: 'Nov', accuracy: 97.3 },
];

const topSigns = [
  { sign: 'A', detections: 847 },
  { sign: 'H', detections: 743 },
  { sign: 'B', detections: 612 },
  { sign: 'O', detections: 589 },
  { sign: 'L', detections: 524 },
  { sign: 'E', detections: 498 },
];

const signDistribution = [
  { name: 'Vocales', value: 35, color: C.mintDark },
  { name: 'Consonantes', value: 48, color: C.turquoise },
  { name: 'Especiales', value: 17, color: '#DCE8F2' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl p-3 shadow-lg" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
      <p className="text-gray-400 mb-1" style={{ fontSize: '11px' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: '12px', fontWeight: 500 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export function Statistics() {
  const totalSigns = weeklyData.reduce((a, b) => a + b.signs, 0);
  const totalSessions = weeklyData.reduce((a, b) => a + b.sessions, 0);
  const avgAccuracy = weeklyData.reduce((a, b) => a + b.accuracy, 0) / weeklyData.length;

  return (
    <div className="p-4 lg:p-8 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>Estadísticas</h1>
          <p className="text-gray-400" style={{ fontSize: '13px' }}>Análisis de rendimiento y uso del sistema</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-white transition-all"
            style={{ fontSize: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Calendar className="w-3.5 h-3.5" /> Esta semana
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:bg-white transition-all"
            style={{ fontSize: '12px', border: '1px solid rgba(0,0,0,0.08)' }}>
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Señas Detectadas', value: totalSigns.toLocaleString(), sub: 'Esta semana', icon: BarChart2, color: C.mintDark, trend: '+12%' },
          { label: 'Sesiones', value: totalSessions, sub: 'Esta semana', icon: Users, color: C.turquoise, trend: '+8%' },
          { label: 'Precisión Media', value: `${avgAccuracy.toFixed(1)}%`, sub: 'Esta semana', icon: TrendingUp, color: '#7BCB9D', trend: '+0.3%' },
          { label: 'Tiempo Total', value: '14.2h', sub: 'Esta semana', icon: Clock, color: '#DCE8F2', trend: '+2h' },
        ].map(({ label, value, sub, icon: Icon, color, trend }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-3xl p-5 shadow-sm"
            style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: `${color}22` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(173,235,179,0.12)', color: C.mintDark, fontSize: '10px', fontWeight: 600 }}>
                {trend}
              </span>
            </div>
            <div className="font-bold text-gray-900 mb-0.5" style={{ fontSize: '22px', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
            <div className="text-gray-600" style={{ fontSize: '12px', fontWeight: 500 }}>{label}</div>
            <div className="text-gray-400" style={{ fontSize: '11px' }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Weekly activity */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4" style={{ color: C.mintDark }} />
            <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>Señas Detectadas por Día</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="signs" name="Señas" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.mintDark} />
                  <stop offset="100%" stopColor={C.mint} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution pie */}
        <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="text-gray-700 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Distribución por Tipo</div>
          <div className="flex justify-center">
            <PieChart width={160} height={160}>
              <Pie data={signDistribution} cx={75} cy={75} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {signDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, '']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
            </PieChart>
          </div>
          <div className="space-y-2 mt-2">
            {signDistribution.map(({ name, value, color }) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-gray-600 flex-1" style={{ fontSize: '12px' }}>{name}</span>
                <span className="font-bold" style={{ fontSize: '12px', color }}>{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Accuracy history */}
        <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: C.mintDark }} />
            <span className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>Evolución de Precisión</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={accuracyHistory} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.mint} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.mint} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="accuracy" name="Precisión %" stroke={C.mintDark} strokeWidth={2.5} fill="url(#areaGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top signs */}
        <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="text-gray-700 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Señas Más Detectadas</div>
          <div className="space-y-3">
            {topSigns.map(({ sign, detections }, i) => {
              const max = topSigns[0].detections;
              return (
                <div key={sign} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0"
                    style={{
                      background: i === 0 ? 'linear-gradient(135deg, #ADEBB3, #6ED3CF)' : 'rgba(173,235,179,0.1)',
                      color: i === 0 ? '#fff' : '#374151',
                      fontSize: '14px',
                    }}>
                    {sign}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600" style={{ fontSize: '12px', fontWeight: 500 }}>Seña "{sign}"</span>
                      <span style={{ fontSize: '11px', color: C.mintDark, fontWeight: 500 }}>{detections.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(173,235,179,0.1)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(detections / max) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? 'linear-gradient(90deg, #ADEBB3, #6ED3CF)' : `rgba(173,235,179,${0.5 - i * 0.06})` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

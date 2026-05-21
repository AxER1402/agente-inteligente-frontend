import { useState } from 'react';
import { Camera, Cpu, Volume2, Shield, ChevronRight, Save } from 'lucide-react';
import { motion } from 'motion/react';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: value ? 'linear-gradient(135deg, #ADEBB3, #7BCB9D)' : '#E5E7EB' }}>
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0 mr-4">
        <div className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>{label}</div>
        {description && <div className="text-gray-400" style={{ fontSize: '11px' }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

function SettingCard({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 shadow-sm"
      style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="text-gray-800" style={{ fontSize: '15px', fontWeight: 600 }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

export function Settings() {
  const [settings, setSettings] = useState({
    cameraEnabled: true,
    autoStart: false,
    highQuality: true,
    showLandmarks: true,
    showBoundingBox: true,
    showFPS: true,
    gpuAcceleration: true,
    realTimeMode: true,
    autoSave: true,
    voiceEnabled: true,
    voiceSpeed: 1.0,
    language: 'es',
    notifications: true,
    soundEffects: false,
    darkMode: false,
    compactUI: false,
    autoTrain: false,
    saveSessions: true,
    shareAnonymous: false,
  });

  const set = (key: string, val: any) => setSettings(s => ({ ...s, [key]: val }));

  return (
    <div className="p-4 lg:p-8 space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 mb-1" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>Configuración</h1>
          <p className="text-gray-400" style={{ fontSize: '13px' }}>Personaliza SignAI según tus preferencias</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)', fontSize: '13px', fontWeight: 500 }}>
          <Save className="w-4 h-4" /> Guardar
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Camera */}
        <SettingCard icon={Camera} title="Cámara y Visión" color={C.mintDark}>
          <SettingRow label="Cámara activa" description="Habilitar feed de la cámara">
            <Toggle value={settings.cameraEnabled} onChange={v => set('cameraEnabled', v)} />
          </SettingRow>
          <SettingRow label="Inicio automático" description="Iniciar cámara al abrir la app">
            <Toggle value={settings.autoStart} onChange={v => set('autoStart', v)} />
          </SettingRow>
          <SettingRow label="Alta resolución" description="720p para mayor precisión">
            <Toggle value={settings.highQuality} onChange={v => set('highQuality', v)} />
          </SettingRow>
          <SettingRow label="Mostrar landmarks" description="Visualizar puntos de detección">
            <Toggle value={settings.showLandmarks} onChange={v => set('showLandmarks', v)} />
          </SettingRow>
          <SettingRow label="Cuadro delimitador" description="Rectángulo alrededor de la mano">
            <Toggle value={settings.showBoundingBox} onChange={v => set('showBoundingBox', v)} />
          </SettingRow>
          <SettingRow label="Mostrar FPS" description="Contador de fotogramas por segundo">
            <Toggle value={settings.showFPS} onChange={v => set('showFPS', v)} />
          </SettingRow>
        </SettingCard>

        {/* AI model */}
        <SettingCard icon={Cpu} title="Modelo de IA" color={C.turquoise}>
          <SettingRow label="Aceleración GPU" description="Usar CUDA para inferencia más rápida">
            <Toggle value={settings.gpuAcceleration} onChange={v => set('gpuAcceleration', v)} />
          </SettingRow>
          <SettingRow label="Modo tiempo real" description="Predicciones a 30 FPS">
            <Toggle value={settings.realTimeMode} onChange={v => set('realTimeMode', v)} />
          </SettingRow>
          <SettingRow label="Auto-guardar dataset" description="Guardar muestras automáticamente">
            <Toggle value={settings.autoSave} onChange={v => set('autoSave', v)} />
          </SettingRow>
          <SettingRow label="Entrenamiento automático" description="Re-entrenar cuando hay datos nuevos">
            <Toggle value={settings.autoTrain} onChange={v => set('autoTrain', v)} />
          </SettingRow>
          <SettingRow label="Umbral de confianza">
            <div className="flex items-center gap-2">
              <input type="range" min="70" max="99" defaultValue="85" className="w-24 accent-green-400" />
              <span className="font-mono" style={{ fontSize: '12px', color: C.mintDark }}>85%</span>
            </div>
          </SettingRow>
          <SettingRow label="Versión del modelo">
            <span className="px-2.5 py-1 rounded-xl text-xs font-medium" style={{ background: 'rgba(173,235,179,0.15)', color: '#1A3A2A', fontSize: '11px' }}>
              v2.1.0
            </span>
          </SettingRow>
        </SettingCard>

        {/* Voice */}
        <SettingCard icon={Volume2} title="Síntesis de Voz" color="#7BCB9D">
          <SettingRow label="Voz habilitada" description="Reproducir texto detectado">
            <Toggle value={settings.voiceEnabled} onChange={v => set('voiceEnabled', v)} />
          </SettingRow>
          <SettingRow label="Idioma">
            <select
              className="px-3 py-1.5 rounded-xl border-0 outline-none text-sm text-gray-700"
              style={{ background: C.lightGray, fontSize: '12px' }}
              value={settings.language}
              onChange={e => set('language', e.target.value)}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
            </select>
          </SettingRow>
          <SettingRow label="Velocidad de voz">
            <div className="flex items-center gap-2">
              <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-24 accent-green-400" />
              <span className="font-mono" style={{ fontSize: '12px', color: C.mintDark }}>1.0×</span>
            </div>
          </SettingRow>
          <SettingRow label="Efectos de sonido" description="Sonidos de retroalimentación de UI">
            <Toggle value={settings.soundEffects} onChange={v => set('soundEffects', v)} />
          </SettingRow>
        </SettingCard>

        {/* App & privacy */}
        <SettingCard icon={Shield} title="Privacidad y Aplicación" color="#DCE8F2">
          <SettingRow label="Notificaciones" description="Alertas de entrenamiento y errores">
            <Toggle value={settings.notifications} onChange={v => set('notifications', v)} />
          </SettingRow>
          <SettingRow label="Guardar sesiones" description="Historial local de traducciones">
            <Toggle value={settings.saveSessions} onChange={v => set('saveSessions', v)} />
          </SettingRow>
          <SettingRow label="Compartir datos anónimos" description="Ayudar a mejorar SignAI">
            <Toggle value={settings.shareAnonymous} onChange={v => set('shareAnonymous', v)} />
          </SettingRow>
          <SettingRow label="UI compacta" description="Menos espaciado para más contenido">
            <Toggle value={settings.compactUI} onChange={v => set('compactUI', v)} />
          </SettingRow>
          <SettingRow label="Versión de la app">
            <span className="text-gray-400" style={{ fontSize: '12px' }}>SignAI v2.1.0</span>
          </SettingRow>
          <SettingRow label="Exportar datos">
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: 'rgba(173,235,179,0.12)', color: C.mintDark, fontWeight: 500, fontSize: '12px' }}>
              Exportar <ChevronRight className="w-3 h-3" />
            </button>
          </SettingRow>
        </SettingCard>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-3xl p-5 shadow-sm" style={{ border: '1px solid rgba(239,68,68,0.1)' }}>
        <div className="text-gray-700 mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Zona Avanzada</div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Resetear configuración', desc: 'Volver a valores por defecto' },
            { label: 'Eliminar dataset', desc: 'Borrar todas las muestras' },
            { label: 'Limpiar historial', desc: 'Borrar historial de sesiones' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-2xl flex-1 min-w-48"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <div>
                <div className="text-red-600" style={{ fontSize: '13px', fontWeight: 500 }}>{label}</div>
                <div className="text-red-400" style={{ fontSize: '11px' }}>{desc}</div>
              </div>
              <button className="p-1.5 rounded-xl hover:bg-red-50 transition-colors">
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
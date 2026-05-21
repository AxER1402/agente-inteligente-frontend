import { useState, useEffect } from 'react';
import { Cpu, Play, Pause, Square, TrendingUp, AlertCircle, CheckCircle, Layers, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import API_URL from '../../config';

const C = { mint: '#ADEBB3', mintDark: '#7BCB9D', turquoise: '#6ED3CF', lightGray: '#F5F7F6' };

export function TrainModel() {
  const [isTraining, setIsTraining] = useState(false);
  const [status, setStatus] = useState({ model_loaded: false });
  const [stats, setStats] = useState({ total_samples: 0, labels: {} });

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/`);
      setStatus(response.data);
      setIsTraining(response.data.is_training);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchStats();
    
    // Poll status while training
    const interval = setInterval(() => {
      fetchStatus();
      if (!isTraining) fetchStats();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isTraining]);

  const handleTrain = async () => {
    try {
      await axios.post(`${API_URL}/train`);
      setIsTraining(true);
    } catch (error) {
      console.error("Error starting training:", error);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div>
        <h1 className="font-bold text-gray-900 dark:text-zinc-100 mb-1" style={{ fontSize: '22px', letterSpacing: '-0.03em' }}>Entrenar Modelo</h1>
        <p className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '13px' }}>Algoritmo: RandomForestClassifier (Scikit-Learn)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dataset Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-zinc-200">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="font-bold">Estado del Dataset</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-zinc-400 text-sm">Total muestras:</span>
                <span className="font-bold dark:text-zinc-100">{stats.total_samples}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-zinc-400 text-sm">Señas etiquetadas:</span>
                <span className="font-bold dark:text-zinc-100">{Object.keys(stats.labels).length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-zinc-200">
              <Layers className="w-5 h-5 text-blue-500" />
              <span className="font-bold">Arquitectura</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-700 dark:text-blue-300">Input: 63 features (Landmarks)</div>
              <div className="p-2 bg-green-50 dark:bg-green-950/40 rounded-xl text-green-700 dark:text-green-300">Model: Random Forest (100 trees)</div>
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-700 dark:text-purple-300">Task: Multi-class Classification</div>
            </div>
          </div>
        </div>

        {/* Training Control */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-zinc-800 h-full flex flex-col justify-center items-center text-center">
            {isTraining ? (
              <div className="space-y-6">
                <div className="relative">
                   <div className="w-24 h-24 border-8 border-green-100 dark:border-green-900/40 border-t-green-500 rounded-full animate-spin mx-auto" />
                   <Cpu className="w-8 h-8 text-green-600 dark:text-green-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">Entrenando Modelo...</h2>
                    <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">El servidor está procesando el archivo CSV y ajustando el Random Forest</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-950/40 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-10 h-10 text-green-500 dark:text-green-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-zinc-100">Listo para Entrenar</h2>
                    <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">Se utilizará el 100% de los datos recolectados en el CSV</p>
                </div>
                <button 
                  onClick={handleTrain}
                  disabled={stats.total_samples < 10}
                  className="px-10 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-100 dark:shadow-green-950/30 hover:bg-green-600 transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)' }}>
                  RE-ENTRENAR MODELO
                </button>
                {stats.total_samples < 10 && (
                    <p className="text-red-400 dark:text-red-400 text-xs font-medium">Necesitas al menos 10 muestras para entrenar</p>
                )}
              </div>
            )}

            <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                    <div className="text-xs text-gray-400 dark:text-zinc-500 mb-1">Modelo Actual</div>
                    <div className="flex items-center justify-center gap-2">
                        {status.model_loaded ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                        <span className="font-bold text-gray-700 dark:text-zinc-200">{status.model_loaded ? 'Cargado' : 'No encontrado'}</span>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                    <div className="text-xs text-gray-400 dark:text-zinc-500 mb-1">Ultima Act.</div>
                    <div className="font-bold text-gray-700 dark:text-zinc-200">Hoy</div>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

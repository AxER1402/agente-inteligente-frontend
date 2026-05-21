import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { RealTimeTranslation } from './pages/RealTimeTranslation';
import { CreateWords } from './pages/CreateWords';
import { HandDetector } from './pages/HandDetector';
import { CollectDataset } from './pages/CollectDataset';
import { TrainModel } from './pages/TrainModel';
import { Predictions } from './pages/Predictions';
import { Statistics } from './pages/Statistics';
import { Settings } from './pages/Settings';
import { LearnSign } from './pages/LearnSign';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'traduccion', Component: RealTimeTranslation },
      { path: 'aprender', Component: LearnSign },
      { path: 'crear-palabras', Component: CreateWords },
      { path: 'detector-mano', Component: HandDetector },
      { path: 'dataset', Component: CollectDataset },
      { path: 'entrenar', Component: TrainModel },
      { path: 'predicciones', Component: Predictions },
      { path: 'estadisticas', Component: Statistics },
      { path: 'configuracion', Component: Settings },
    ],
  },
]);

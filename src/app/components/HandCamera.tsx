import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import * as drawing from '@mediapipe/drawing_utils';

interface HandCameraProps {
  onLandmarks?: (landmarks: number[]) => void;
  onRawLandmarks?: (landmarks: any[]) => void;
  compact?: boolean;
}

export function HandCamera({ onLandmarks, onRawLandmarks, compact = false }: HandCameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Guardar la callback en una ref para evitar re-iniciar la cámara si cambia
  const onLandmarksRef = useRef(onLandmarks);
  useEffect(() => {
    onLandmarksRef.current = onLandmarks;
  }, [onLandmarks]);

  const onRawLandmarksRef = useRef(onRawLandmarks);
  useEffect(() => {
    onRawLandmarksRef.current = onRawLandmarks;
  }, [onRawLandmarks]);

  // Función para normalizar landmarks igual que en el script de Python
  const normalizeLandmarks = (landmarks: any[]) => {
    const puntos: number[] = [];
    const base_x = landmarks[0].x;
    const base_y = landmarks[0].y;
    const base_z = landmarks[0].z;

    for (const lm of landmarks) {
      // Invertir el eje X relativo para simular el cv2.flip(frame, 1) del backend
      puntos.push(-(lm.x - base_x));
      puntos.push(lm.y - base_y);
      puntos.push(lm.z - base_z);
    }

    // Normalización de escala
    const maxVal = Math.max(...puntos.map(v => Math.abs(v)));
    if (maxVal > 0) {
      return puntos.map(v => v / maxVal);
    }
    return puntos;
  };

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      const canvasCtx = canvasRef.current?.getContext('2d');
      if (!canvasCtx || !canvasRef.current || !webcamRef.current?.video) return;

      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, videoWidth, videoHeight);
      
      // Dibujar el video
      canvasCtx.drawImage(results.image, 0, 0, videoWidth, videoHeight);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Dibujar conectores y puntos
        drawing.drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: '#ADEBB3',
          lineWidth: 5,
        });
        drawing.drawLandmarks(canvasCtx, landmarks, {
          color: '#6ED3CF',
          lineWidth: 2,
          radius: 4,
        });

        // Enviar landmarks normalizados al componente padre
        if (onLandmarksRef.current) {
          const normalized = normalizeLandmarks(landmarks);
          onLandmarksRef.current(normalized);
        }
        if (onRawLandmarksRef.current) {
          onRawLandmarksRef.current(landmarks);
        }
      } else {
          // Si no hay manos, podemos enviar un array vacío o null
          if (onLandmarksRef.current) onLandmarksRef.current([]);
          if (onRawLandmarksRef.current) onRawLandmarksRef.current([]);
      }
      
      canvasCtx.restore();
      if (!isLoaded) setIsLoaded(true);
    });

    let camera: cam.Camera | null = null;
    if (webcamRef.current?.video) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) {
            await hands.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      if (camera) {
        camera.stop();
      }
      hands.close();
    };
  }, []);

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center">
      <Webcam
        ref={webcamRef}
        className="hidden"
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user"
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover mirrored"
        style={{ transform: 'scaleX(-1)' }} // Espejo para que se sienta natural
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0F1E] text-[#ADEBB3]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#ADEBB3] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Iniciando Cámara e IA...</span>
          </div>
        </div>
      )}
    </div>
  );
}

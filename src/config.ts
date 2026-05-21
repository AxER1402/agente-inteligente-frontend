// Configuración central de la API
// En producción usa la variable de entorno VITE_API_URL
// En desarrollo usa localhost:8000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default API_URL;

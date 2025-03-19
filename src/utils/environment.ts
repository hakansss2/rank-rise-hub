
// Environment variables için yardımcı fonksiyonlar

export const getApiBaseUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Fallback URL'leri
  return process.env.NODE_ENV === 'production'
    ? 'https://your-production-api-url.com/api'
    : 'http://localhost:5000/api';
};

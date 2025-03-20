
// Environment variables için yardımcı fonksiyonlar

export const getApiBaseUrl = (): string => {
  // import.meta.env kullanarak Vite ortam değişkenlerini alalım
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  if (envApiUrl) {
    console.log('API URL from environment:', envApiUrl);
    return envApiUrl;
  }
  
  // Determine if we're running on Glitch or Lovable
  const isGlitch = window.location.hostname.includes('glitch.me');
  const isLovable = window.location.hostname.includes('lovableproject.com');
  const isDevelopment = import.meta.env.MODE === 'development';
  
  // Default to Glitch URL when running on production
  let fallbackUrl = isDevelopment
    ? 'http://localhost:5000/api'
    : 'https://forested-saber-sandal.glitch.me/api';
    
  // If running on Glitch, use relative URL to avoid CORS
  if (isGlitch) {
    fallbackUrl = '/api';
  }
  
  console.log('Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

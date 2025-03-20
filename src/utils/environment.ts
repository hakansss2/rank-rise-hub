
// Environment variables için yardımcı fonksiyonlar

export const getApiBaseUrl = (): string => {
  // import.meta.env kullanarak Vite ortam değişkenlerini alalım
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  if (envApiUrl) {
    console.log('API URL from environment:', envApiUrl);
    return envApiUrl;
  }
  
  // Fallback URL'leri (eğer environment değişkenleri bulunamazsa)
  const fallbackUrl = import.meta.env.MODE === 'production'
    ? 'https://forested-saber-sandal.glitch.me/api'
    : 'http://localhost:5000/api';
  
  console.log('Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
};


// Environment variables için yardımcı fonksiyonlar

export const getApiBaseUrl = (): string => {
  // import.meta.env kullanarak Vite ortam değişkenlerini alalım
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  if (envApiUrl) {
    console.log('API URL from environment:', envApiUrl);
    return envApiUrl;
  }
  
  // Fallback URL'leri (eğer environment değişkenleri bulunamazsa)
  const isGlitch = window.location.hostname.includes('glitch.me');
  const isDevelopment = import.meta.env.MODE === 'development';
  
  let fallbackUrl = isDevelopment
    ? 'http://localhost:5000/api'
    : 'https://forested-saber-sandal.glitch.me/api';
    
  // Eğer Glitch üzerinde çalışıyorsa ve development modunda değilse
  if (isGlitch && !isDevelopment) {
    // Mevcut hostnameyi alıp API yolunu oluştur
    const currentHostname = window.location.hostname;
    fallbackUrl = `https://${currentHostname}/api`;
  }
  
  console.log('Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
};

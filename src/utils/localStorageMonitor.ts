
/**
 * Utility function to periodically check localStorage for debugging
 * @param key - The localStorage key to monitor
 * @param prefix - A prefix for logging messages
 * @param interval - Check interval in milliseconds (default: 5000)
 * @returns Cleanup function to clear the interval
 */
export const monitorLocalStorage = (
  key: string, 
  prefix: string = '🔎', 
  interval: number = 1000  // Daha sık kontrol etmek için 3000'den 1000'e düşürüldü
): (() => void) => {
  const checkLocalStorage = () => {
    console.log(`${prefix} Checking localStorage for ${key}...`);
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log(`${prefix} Current ${key} in localStorage:`, 
            Array.isArray(parsedData) ? `${parsedData.length} items` : 'Object found',
            parsedData);
          
          // Dönen verileri null olmayanlara filtrele
          if (Array.isArray(parsedData)) {
            const validItems = parsedData.filter(item => item !== null);
            if (validItems.length !== parsedData.length) {
              console.warn(`${prefix} Found ${parsedData.length - validItems.length} null items in localStorage, fixing`);
              localStorage.setItem(key, JSON.stringify(validItems));
              return validItems;
            }
          }
          
          return parsedData;
        } catch (parseError) {
          console.error(`${prefix} Failed to parse ${key} data:`, parseError);
          console.log(`${prefix} Raw data:`, storedData);
          
          // Hatalı JSON onarımı
          try {
            // Son çare: parse edemiyorsak boş dizi ile başlat
            localStorage.setItem(key, JSON.stringify([]));
            console.log(`${prefix} Reset ${key} to empty array after parse error`);
            return [];
          } catch (e) {
            console.error(`${prefix} Failed to reset ${key}:`, e);
          }
          return null;
        }
      } else {
        console.log(`${prefix} No ${key} found in localStorage`);
        
        // Bulunamazsa başlat
        localStorage.setItem(key, JSON.stringify([]));
        console.log(`${prefix} Initialized ${key} as empty array`);
        return [];
      }
    } catch (e) {
      console.error(`${prefix} Error reading localStorage:`, e);
      return null;
    }
  };
  
  // Hemen kontrol et ve parse edilmiş veriyi döndür
  const initialData = checkLocalStorage();
  
  // Daha hızlı geri bildirim için azaltılmış aralıkla periyodik kontrol
  const intervalId = setInterval(checkLocalStorage, interval);
  
  // Temizleme fonksiyonunu döndür
  return () => clearInterval(intervalId);
};

/**
 * Force refresh localStorage data for a specific key
 * @param key - The localStorage key to refresh
 * @returns The parsed data or null if not found/invalid
 */
export const forceRefreshLocalStorage = (key: string): any | null => {
  console.log(`🔄 Force refreshing ${key} from localStorage...`);
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log(`✅ Successfully refreshed ${key}:`, 
          Array.isArray(parsedData) ? `${parsedData.length} items found` : 'Object found', 
          parsedData);
        
        // Kayıtlı kullanıcılar ise veri yapısını doğrula
        if (key === 'valorant_registered_users' && Array.isArray(parsedData)) {
          console.log(`🔍 Validating ${parsedData.length} users data...`);
          
          // Filtreleme öncesi null olmayan elemanları al
          const nonNullUsers = parsedData.filter(user => user !== null);
          if (nonNullUsers.length !== parsedData.length) {
            console.warn(`⚠️ Found ${parsedData.length - nonNullUsers.length} null users, removing them`);
            localStorage.setItem(key, JSON.stringify(nonNullUsers));
            parsedData = nonNullUsers;
          }
          
          // Gerekli alanları olan kullanıcıları filtrele
          const validUsers = nonNullUsers.filter(user => 
            user && user.id && user.email && user.username);
          
          if (validUsers.length !== nonNullUsers.length) {
            console.warn(`⚠️ Found ${nonNullUsers.length - validUsers.length} invalid users in localStorage`);
            localStorage.setItem(key, JSON.stringify(validUsers));
            return validUsers;
          }
        }
        
        return parsedData;
      } catch (parseError) {
        console.error(`❌ Failed to parse ${key}:`, parseError);
        
        // Parse başarısız olursa boş dizi ile başlat
        localStorage.setItem(key, JSON.stringify([]));
        console.log(`🔄 Initialized ${key} as empty array after parse error`);
        return [];
      }
    } else {
      console.log(`⚠️ No ${key} found in localStorage`);
      
      // Anahtar yoksa başlat
      localStorage.setItem(key, JSON.stringify([]));
      console.log(`🔄 Initialized ${key} as empty array`);
      return [];
    }
  } catch (e) {
    console.error(`❌ Error reading ${key} from localStorage:`, e);
    return null;
  }
};

// Veri doğrulama ve onarma fonksiyonu
export const validateAndRepairLocalStorage = (key: string) => {
  console.log(`🔧 Validating and repairing ${key} in localStorage...`);
  try {
    const data = localStorage.getItem(key);
    
    // Veri yoksa, boş dizi oluştur
    if (!data) {
      localStorage.setItem(key, JSON.stringify([]));
      console.log(`🔧 Created empty array for ${key}`);
      return [];
    }
    
    // JSON.parse deneme
    try {
      const parsedData = JSON.parse(data);
      
      // Dizi değilse veya null ise, sıfırla
      if (!Array.isArray(parsedData) || parsedData === null) {
        localStorage.setItem(key, JSON.stringify([]));
        console.log(`🔧 Reset ${key} to empty array (was not a valid array)`);
        return [];
      }
      
      // Null elemanları temizle
      const cleanedData = parsedData.filter(item => item !== null);
      if (cleanedData.length !== parsedData.length) {
        localStorage.setItem(key, JSON.stringify(cleanedData));
        console.log(`🔧 Removed ${parsedData.length - cleanedData.length} null items from ${key}`);
      }
      
      return cleanedData;
    } catch (e) {
      console.error(`🔧 Error parsing ${key}, resetting to empty array:`, e);
      localStorage.setItem(key, JSON.stringify([]));
      return [];
    }
  } catch (e) {
    console.error(`🔧 Storage error while validating ${key}:`, e);
    return null;
  }
};

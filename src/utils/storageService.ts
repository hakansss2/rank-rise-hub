
/**
 * Centralized storage service for consistent data handling across browser sessions
 */

const STORAGE_VERSION = 'v1'; // For future migration support
const STORAGE_PREFIX = 'valorant_';

// Storage keys
export const STORAGE_KEYS = {
  USERS: `${STORAGE_PREFIX}registered_users`,
  CURRENT_USER: `${STORAGE_PREFIX}user`,
  ORDERS: `${STORAGE_PREFIX}orders`,
  STORAGE_VERSION: `${STORAGE_PREFIX}storage_version`,
  INITIALIZED: `${STORAGE_PREFIX}initialized`
};

// Check and initialize storage version
const initializeStorage = () => {
  try {
    const version = localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);
    if (!version) {
      localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION);
      console.log('🔧 Storage initialized with version:', STORAGE_VERSION);
    }
    
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      const defaultUsers = [];
      const defaultOrders = [];
      
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(defaultOrders));
      }
      
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      console.log('🔧 Storage initialized with default data');
    }
  } catch (e) {
    console.error('❌ Failed to initialize storage version:', e);
  }
};

// Initialize on service import
initializeStorage();

/**
 * Get data from localStorage with validation and fallback
 * @param key Storage key 
 * @param defaultValue Default value if not found or invalid
 */
export const getData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      console.warn(`⚠️ No data found for ${key}, using default value`);
      
      if (key === STORAGE_KEYS.USERS || key === STORAGE_KEYS.ORDERS) {
        setData(key, defaultValue);
        console.log(`🔄 Re-initialized missing key: ${key}`);
      }
      
      return defaultValue;
    }
    
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(defaultValue) && !Array.isArray(parsedData)) {
        console.warn(`⚠️ Expected array for ${key} but got:`, typeof parsedData);
        setData(key, defaultValue);
        return defaultValue;
      }
      return parsedData;
    } catch (parseError) {
      console.error(`❌ Error parsing ${key}:`, parseError);
      
      if (key === STORAGE_KEYS.USERS || key === STORAGE_KEYS.ORDERS) {
        setData(key, defaultValue);
        console.log(`🔄 Recovered corrupted key: ${key}`);
      }
      
      return defaultValue;
    }
  } catch (e) {
    console.error(`❌ Storage error for ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Store data in localStorage with safeguards and redundancy
 * @param key Storage key
 * @param data Data to store
 */
export const setData = <T>(key: string, data: T): boolean => {
  try {
    if (data === undefined || data === null) {
      console.error(`❌ Attempted to store invalid data in ${key}:`, data);
      return false;
    }
    
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
    
    const verificationCheck = localStorage.getItem(key);
    if (!verificationCheck) {
      console.error(`❌ Verification failed: Could not read back data for ${key}`);
      return false;
    }
    
    if (key === STORAGE_KEYS.USERS || key === STORAGE_KEYS.ORDERS) {
      const backupKey = `${key}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, json);
      
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(k => k.startsWith(`${key}_backup_`)).sort();
      
      if (backupKeys.length > 2) {
        for (let i = 0; i < backupKeys.length - 2; i++) {
          localStorage.removeItem(backupKeys[i]);
        }
      }
    }
    
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: json,
      oldValue: localStorage.getItem(key) || null,
      storageArea: localStorage,
      url: window.location.href
    }));
    
    return true;
  } catch (e) {
    console.error(`❌ Failed to save data to ${key}:`, e);
    
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      try {
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys.filter(k => k.includes('_backup_'));
        
        backupKeys.forEach(bk => localStorage.removeItem(bk));
        
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`🔄 Recovered from storage quota exceeded by clearing backups`);
        return true;
      } catch (recoveryError) {
        console.error(`❌ Failed to recover from storage quota exceeded:`, recoveryError);
      }
    }
    
    return false;
  }
};

/**
 * Add a storage listener that works across tabs and in the same tab
 */
export const addStorageListener = (
  key: string, 
  callback: (data: any) => void
): (() => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        callback(data);
      } catch (e) {
        console.error(`❌ Error handling storage event for ${key}:`, e);
      }
    }
  };
  
  window.addEventListener('storage', handleStorage);
  
  return () => {
    window.removeEventListener('storage', handleStorage);
  };
};

/**
 * Remove data from localStorage
 */
export const removeData = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`❌ Failed to remove data from ${key}:`, e);
  }
};

/**
 * Clear all app data
 */
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`❌ Failed to clear ${key}:`, e);
    }
  });
};

/**
 * Force refresh for specific key with additional verification
 */
export const refreshData = <T>(key: string, defaultValue: T): T => {
  console.log(`🔄 Refreshing data for ${key}`);
  
  try {
    const dataStr = localStorage.getItem(key);
    if (!dataStr) {
      console.warn(`⚠️ No data found during refresh for ${key}, using default`);
      setData(key, defaultValue);
      return defaultValue;
    }
    
    let data;
    try {
      data = JSON.parse(dataStr);
    } catch (e) {
      console.error(`❌ Error parsing data during refresh for ${key}:`, e);
      
      if (key === STORAGE_KEYS.USERS || key === STORAGE_KEYS.ORDERS) {
        const allKeys = Object.keys(localStorage);
        const backupKeys = allKeys
          .filter(k => k.startsWith(`${key}_backup_`))
          .sort()
          .reverse();
        
        let recovered = false;
        for (const backupKey of backupKeys) {
          try {
            const backupData = localStorage.getItem(backupKey);
            if (backupData) {
              const parsedBackupData = JSON.parse(backupData);
              setData(key, parsedBackupData);
              data = parsedBackupData;
              recovered = true;
              console.log(`🔄 Recovered ${key} from backup: ${backupKey}`);
              break;
            }
          } catch (backupError) {
            console.error(`❌ Error recovering from backup ${backupKey}:`, backupError);
          }
        }
        
        if (!recovered) {
          setData(key, defaultValue);
          return defaultValue;
        }
      } else {
        setData(key, defaultValue);
        return defaultValue;
      }
    }
    
    if (Array.isArray(defaultValue) && !Array.isArray(data)) {
      console.warn(`⚠️ Expected array during refresh for ${key} but got:`, typeof data);
      setData(key, defaultValue);
      return defaultValue;
    }
    
    const json = JSON.stringify(data);
    window.dispatchEvent(new StorageEvent('storage', {
      key,
      newValue: json,
      oldValue: localStorage.getItem(key) || null,
      storageArea: localStorage,
      url: window.location.href
    }));
    
    return data;
  } catch (e) {
    console.error(`❌ Storage error during refresh for ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Synchronize data across all tabs by force
 * Call this function after important data changes
 */
export const syncAllTabs = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: data,
          oldValue: null,
          storageArea: localStorage,
          url: window.location.href
        }));
      }
    });
    console.log('🔄 Forced cross-tab synchronization');
  } catch (e) {
    console.error('❌ Failed to force cross-tab synchronization:', e);
  }
};

/**
 * Initialize periodic storage health check and synchronization
 * Call this in your app initialization
 */
export const initializeStorageHealthCheck = (): (() => void) => {
  console.log('🔄 Setting up storage health check');
  
  const intervalId = setInterval(() => {
    try {
      const usersExists = localStorage.getItem(STORAGE_KEYS.USERS) !== null;
      const ordersExists = localStorage.getItem(STORAGE_KEYS.ORDERS) !== null;
      
      if (!usersExists) {
        console.warn('⚠️ Users data missing, restoring default');
        setData(STORAGE_KEYS.USERS, []);
      }
      
      if (!ordersExists) {
        console.warn('⚠️ Orders data missing, restoring default');
        setData(STORAGE_KEYS.ORDERS, []);
      }
      
      syncAllTabs();
    } catch (e) {
      console.error('❌ Error in storage health check:', e);
    }
  }, 60000);
  
  return () => clearInterval(intervalId);
};

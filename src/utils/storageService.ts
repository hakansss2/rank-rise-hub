
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
  STORAGE_VERSION: `${STORAGE_PREFIX}storage_version`
};

// Check and initialize storage version
const initializeStorage = () => {
  try {
    const version = localStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);
    if (!version) {
      localStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION);
      console.log('🔧 Storage initialized with version:', STORAGE_VERSION);
    }
  } catch (e) {
    console.error('❌ Failed to initialize storage version:', e);
  }
};

// Initialize on service import
initializeStorage();

/**
 * Get data from localStorage with validation
 * @param key Storage key 
 * @param defaultValue Default value if not found or invalid
 */
export const getData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(defaultValue) && !Array.isArray(parsedData)) {
        console.warn(`⚠️ Expected array for ${key} but got:`, typeof parsedData);
        return defaultValue;
      }
      return parsedData;
    } catch (parseError) {
      console.error(`❌ Error parsing ${key}:`, parseError);
      return defaultValue;
    }
  } catch (e) {
    console.error(`❌ Storage error for ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Store data in localStorage with safeguards
 * @param key Storage key
 * @param data Data to store
 */
export const setData = <T>(key: string, data: T): boolean => {
  try {
    // Validate data before storing
    if (data === undefined || data === null) {
      console.error(`❌ Attempted to store invalid data in ${key}:`, data);
      return false;
    }
    
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
    
    // Storage event won't fire in same tab, so manually dispatch
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
  
  // Listen for storage events (other tabs)
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
 * Force refresh for specific key
 */
export const refreshData = <T>(key: string, defaultValue: T): T => {
  const data = getData(key, defaultValue);
  
  // Notify listeners about the refresh
  const json = JSON.stringify(data);
  window.dispatchEvent(new StorageEvent('storage', {
    key,
    newValue: json,
    oldValue: localStorage.getItem(key) || null,
    storageArea: localStorage,
    url: window.location.href
  }));
  
  return data;
};

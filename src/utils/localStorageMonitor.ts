
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
  interval: number = 5000
): (() => void) => {
  const checkLocalStorage = () => {
    console.log(`${prefix} Checking localStorage for ${key}...`);
    try {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log(`${prefix} Current ${key} in localStorage:`, parsedData.length, parsedData);
          // Return parsed data for further processing
          return parsedData;
        } catch (parseError) {
          console.error(`${prefix} Failed to parse ${key} data:`, parseError);
          console.log(`${prefix} Raw data:`, storedData);
          return null;
        }
      } else {
        console.log(`${prefix} No ${key} found in localStorage`);
        return null;
      }
    } catch (e) {
      console.error(`${prefix} Error reading localStorage:`, e);
      return null;
    }
  };
  
  // Check immediately and return the parsed data
  const initialData = checkLocalStorage();
  
  // Set up periodic check
  const intervalId = setInterval(checkLocalStorage, interval);
  
  // Return cleanup function
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
        console.log(`✅ Successfully refreshed ${key}:`, parsedData.length, parsedData);
        return parsedData;
      } catch (parseError) {
        console.error(`❌ Failed to parse ${key}:`, parseError);
        return null;
      }
    } else {
      console.log(`⚠️ No ${key} found in localStorage`);
      return null;
    }
  } catch (e) {
    console.error(`❌ Error reading ${key} from localStorage:`, e);
    return null;
  }
};

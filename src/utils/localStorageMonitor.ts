
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
  interval: number = 3000
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
          return parsedData;
        } catch (parseError) {
          console.error(`${prefix} Failed to parse ${key} data:`, parseError);
          console.log(`${prefix} Raw data:`, storedData);
          
          // Attempt to fix malformed JSON
          try {
            // Last resort: if we can't parse, initialize with empty array
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
        
        // Initialize if not found
        localStorage.setItem(key, JSON.stringify([]));
        console.log(`${prefix} Initialized ${key} as empty array`);
        return [];
      }
    } catch (e) {
      console.error(`${prefix} Error reading localStorage:`, e);
      return null;
    }
  };
  
  // Check immediately and return the parsed data
  const initialData = checkLocalStorage();
  
  // Set up periodic check with reduced interval for faster feedback
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
        console.log(`✅ Successfully refreshed ${key}:`, 
          Array.isArray(parsedData) ? `${parsedData.length} items found` : 'Object found', 
          parsedData);
        
        // Validate data structure if it's registered users
        if (key === 'valorant_registered_users' && Array.isArray(parsedData)) {
          console.log(`🔍 Validating ${parsedData.length} users data...`);
          
          const validUsers = parsedData.filter(user => 
            user && user.id && user.email && user.username);
          
          if (validUsers.length !== parsedData.length) {
            console.warn(`⚠️ Found ${parsedData.length - validUsers.length} invalid users in localStorage`);
            localStorage.setItem(key, JSON.stringify(validUsers));
            return validUsers;
          }
        }
        
        return parsedData;
      } catch (parseError) {
        console.error(`❌ Failed to parse ${key}:`, parseError);
        
        // Initialize with empty array if parse fails
        localStorage.setItem(key, JSON.stringify([]));
        console.log(`🔄 Initialized ${key} as empty array after parse error`);
        return [];
      }
    } else {
      console.log(`⚠️ No ${key} found in localStorage`);
      
      // Initialize if key doesn't exist
      localStorage.setItem(key, JSON.stringify([]));
      console.log(`🔄 Initialized ${key} as empty array`);
      return [];
    }
  } catch (e) {
    console.error(`❌ Error reading ${key} from localStorage:`, e);
    return null;
  }
};

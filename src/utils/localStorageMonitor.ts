
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
        const parsedData = JSON.parse(storedData);
        console.log(`${prefix} Current ${key} in localStorage:`, parsedData.length, parsedData);
      } else {
        console.log(`${prefix} No ${key} found in localStorage`);
      }
    } catch (e) {
      console.error(`${prefix} Error reading localStorage:`, e);
    }
  };
  
  // Check immediately
  checkLocalStorage();
  
  // Set up periodic check
  const intervalId = setInterval(checkLocalStorage, interval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

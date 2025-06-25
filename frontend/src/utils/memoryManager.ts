// Memory and Cache Management Utility

export interface UserData {
  id: string;
  username?: string;
  email?: string;
}

/**
 * Clear all user-specific localStorage data
 * This includes code, compiler data, and any other user-specific cached data
 */
export const clearUserData = (userId?: string) => {
  const keysToRemove: string[] = [];
  
  console.log(`🧹 Clearing user data for user: ${userId || 'guest'}`);
  
  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // Remove user-specific code data
      if (key.startsWith(`code_${userId || ''}`)) {
        keysToRemove.push(key);
      }
      // Remove compiler data (this is global, but we can clear it on logout)
      if (key.startsWith('compiler_')) {
        keysToRemove.push(key);
      }
      // Remove any other user-specific data patterns
      if (userId && key.includes(userId)) {
        keysToRemove.push(key);
      }
    }
  }
  
  // Remove the keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });
  
  console.log(`✅ Cleared ${keysToRemove.length} user-specific localStorage items`);
  
  // Log remaining items for debugging
  const remainingKeys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter(Boolean);
  console.log(`📊 Remaining localStorage items: ${remainingKeys.length}`, remainingKeys);
};

/**
 * Clear all localStorage data (for complete reset)
 */
export const clearAllData = () => {
  localStorage.clear();
  console.log('Cleared all localStorage data');
};

/**
 * Get all user-specific localStorage keys
 */
export const getUserDataKeys = (userId?: string): string[] => {
  const userKeys: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      if (key.startsWith(`code_${userId || ''}`) || 
          (userId && key.includes(userId)) ||
          key.startsWith('compiler_')) {
        userKeys.push(key);
      }
    }
  }
  
  return userKeys;
};

/**
 * Handle page reload for authenticated users
 * This ensures user data is properly restored after reload
 */
export const handleReload = async (userId?: string) => {
  console.log(`🔄 Handling reload for user: ${userId || 'guest'}`);
  
  if (!userId) {
    // Guest user - clear any potential user data
    console.log('👤 Guest user detected, clearing any potential user data');
    clearUserData();
    return;
  }
  
  // For authenticated users, we keep their data
  // The components will handle loading their specific data
  console.log(`✅ Authenticated user ${userId}, preserving user data`);
  
  // Check if user has cached data
  const hasData = hasCachedUserData(userId);
  console.log(`📦 User has cached data: ${hasData ? 'Yes' : 'No'}`);
  
  // You can add additional reload logic here if needed
  // For example, refreshing user preferences, etc.
};

/**
 * Check if there's any cached user data
 */
export const hasCachedUserData = (userId?: string): boolean => {
  const userKeys = getUserDataKeys(userId);
  return userKeys.length > 0;
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = () => {
  const totalSize = new Blob([JSON.stringify(localStorage)]).size;
  const userKeys = getUserDataKeys();
  
  return {
    totalSize,
    totalSizeKB: Math.round(totalSize / 1024 * 100) / 100,
    userDataKeys: userKeys.length,
    allKeys: localStorage.length
  };
};

/**
 * Clean up old/expired data
 * This can be called periodically to maintain storage health
 */
export const cleanupExpiredData = () => {
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          // Check if the data has an expiration timestamp
          const data = JSON.parse(value);
          if (data.expiresAt && data.expiresAt < now) {
            keysToRemove.push(key);
          }
        }
      } catch (error) {
        // If JSON parsing fails, it's not our structured data, skip it
        continue;
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  if (keysToRemove.length > 0) {
    console.log(`Cleaned up ${keysToRemove.length} expired localStorage items`);
  }
};

/**
 * Set up page reload event handlers
 * This ensures proper cleanup and data handling on page reload
 */
export const setupReloadHandlers = (userId?: string) => {
  // Handle beforeunload event (page refresh/close)
  const handleBeforeUnload = () => {
    // Save any pending data or state
    console.log('Page is being unloaded, saving state...');
    
    // You can add additional cleanup logic here if needed
    // For example, saving current editor state, etc.
  };

  // Handle page visibility change (tab switch, minimize, etc.)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('Page hidden, saving state...');
      // Save state when page becomes hidden
    } else {
      console.log('Page visible again, restoring state...');
      // Restore state when page becomes visible
    }
  };

  // Add event listeners
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

/**
 * Initialize memory management for the application
 * This should be called when the app starts
 */
export const initializeMemoryManagement = (userId?: string) => {
  console.log('Initializing memory management...');
  
  // Clean up expired data on app start
  cleanupExpiredData();
  
  // Set up reload handlers
  const cleanupHandlers = setupReloadHandlers(userId);
  
  // Set up periodic cleanup (every 30 minutes)
  const cleanupInterval = setInterval(cleanupExpiredData, 30 * 60 * 1000);
  
  // Return cleanup function
  return () => {
    cleanupHandlers();
    clearInterval(cleanupInterval);
  };
}; 
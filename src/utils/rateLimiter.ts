
interface RateLimitEntry {
  timestamps: number[];
  blockedUntil: number | null;
}

// In a real app, this would be stored in a database
const rateLimitStore: Record<string, RateLimitEntry> = {};

// Get user's fingerprint (in a real app, you'd use a more robust solution)
export const getUserFingerprint = (): string => {
  // Simple fingerprinting based on localStorage
  const storageKey = 'user_fingerprint';
  let fingerprint = localStorage.getItem(storageKey);
  
  if (!fingerprint) {
    fingerprint = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    localStorage.setItem(storageKey, fingerprint);
  }
  
  return fingerprint;
};

export const checkRateLimit = (): { 
  canSubmit: boolean; 
  waitTime: number; 
  submissionsLeft: number;
  isHourBlock: boolean;
} => {
  const fingerprint = getUserFingerprint();
  const now = Date.now();
  const COOLDOWN_PERIOD = 30 * 1000; // 30 seconds
  const HOUR_BLOCK_PERIOD = 60 * 60 * 1000; // 1 hour
  const MAX_SUBMISSIONS = 5;
  
  // Initialize if not exists
  if (!rateLimitStore[fingerprint]) {
    rateLimitStore[fingerprint] = {
      timestamps: [],
      blockedUntil: null
    };
  }
  
  const userLimit = rateLimitStore[fingerprint];
  
  // Check if user is currently blocked
  if (userLimit.blockedUntil && userLimit.blockedUntil > now) {
    return { 
      canSubmit: false, 
      waitTime: Math.ceil((userLimit.blockedUntil - now) / 1000),
      submissionsLeft: 0,
      isHourBlock: true
    };
  }
  
  // Reset hour block if it has passed
  if (userLimit.blockedUntil && userLimit.blockedUntil <= now) {
    userLimit.blockedUntil = null;
    userLimit.timestamps = [];
  }
  
  // Remove timestamps older than 1 hour (cleanup)
  userLimit.timestamps = userLimit.timestamps.filter(
    time => now - time < HOUR_BLOCK_PERIOD
  );
  
  // Check if reached maximum submissions
  if (userLimit.timestamps.length >= MAX_SUBMISSIONS) {
    userLimit.blockedUntil = now + HOUR_BLOCK_PERIOD;
    return { 
      canSubmit: false, 
      waitTime: HOUR_BLOCK_PERIOD / 1000,
      submissionsLeft: 0,
      isHourBlock: true
    };
  }
  
  // Check cooldown period from last submission
  const lastSubmission = userLimit.timestamps[userLimit.timestamps.length - 1];
  if (lastSubmission && now - lastSubmission < COOLDOWN_PERIOD) {
    return { 
      canSubmit: false, 
      waitTime: Math.ceil((lastSubmission + COOLDOWN_PERIOD - now) / 1000),
      submissionsLeft: MAX_SUBMISSIONS - userLimit.timestamps.length,
      isHourBlock: false
    };
  }
  
  return { 
    canSubmit: true, 
    waitTime: 0,
    submissionsLeft: MAX_SUBMISSIONS - userLimit.timestamps.length,
    isHourBlock: false
  };
};

export const recordSubmission = (): void => {
  const fingerprint = getUserFingerprint();
  
  if (!rateLimitStore[fingerprint]) {
    rateLimitStore[fingerprint] = {
      timestamps: [],
      blockedUntil: null
    };
  }
  
  rateLimitStore[fingerprint].timestamps.push(Date.now());
};

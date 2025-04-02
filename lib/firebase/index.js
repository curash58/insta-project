// Export Firebase services
export * from './auth';
export * from './users';
export * from './posts';
export * from './comments';
export * from './firestore-init';

// You can also export any additional Firebase service modules here as they are created
// For example:
// export * from './storage';
// export * from './notifications';

// Fix for crypto.randomUUID() which might not be available in all environments
if (typeof crypto.randomUUID !== 'function') {
  crypto.randomUUID = () => {
    // Simple UUID generation as fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
} 
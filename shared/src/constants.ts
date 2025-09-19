export const APP_NAME = 'VAudio';
export const APP_VERSION = '1.0.0';

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'aac', 'm4a'] as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
} as const;

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
} as const;

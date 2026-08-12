// src/config.ts
interface Config {
  apiUrl: string;
  geminiApiKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
  appVersion: string;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

export default config;
import axios from "axios";
import i18n from "@/i18n";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api",
  withCredentials: true,
});

// Add request interceptor to include Accept-Language header
instance.interceptors.request.use(
  (config) => {
    // Get current language from i18n (will be 'en' or 'ti')
    const currentLanguage = i18n.language || 'en';
    
    // Add Accept-Language header for backend i18n support
    if (config.headers) {
      config.headers['Accept-Language'] = currentLanguage;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;

// API configuration
// In development, Vite proxy handles /api
// In production/Docker, use the full backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:5000");

export const apiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

export default apiUrl;

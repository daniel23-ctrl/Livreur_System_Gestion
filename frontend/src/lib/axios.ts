import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Intercepteur requête et ajouter le token JWT automatiquement

axiosInstance.interceptors.request.use( (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepter la réponse et  gère les erreurs globalement
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expiré ou invalide → redirection login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
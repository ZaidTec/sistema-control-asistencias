import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:3000/api",
  // baseURL: "http://192.168.1.78:3000/api",
  baseURL: "http://192.168.0.125:3000/api",
  //192.168.0.125
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default api;

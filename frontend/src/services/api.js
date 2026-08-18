import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json"
    }
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

        if (error.response?.status === 401 && localStorage.getItem("token")) {

            localStorage.removeItem("token");
            localStorage.removeItem("usuario");

            window.location.href = "/";
        }

        if (error.response?.status === 403) {

            window.location.href = "/dashboard";
        }

        return Promise.reject(error);
    }
);


export default api;
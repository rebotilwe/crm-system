import axios from 'axios';

// Create an instance so you don't mess with the global axios
const api = axios.create({
    baseURL: 'https://crm-system-staging-626e.up.railway.app/api'
});

// Request Interceptor: Automatically attach the token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Catch the 401 error globally
api.interceptors.response.use(
    (response) => response, // If request is successful, do nothing
    (error) => {
        // Only trigger logout if server specifically says 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            console.error("Token expired or unauthorized. Logging out...");
            localStorage.clear();
            window.location.href = "/login"; // Force redirect
        }
        return Promise.reject(error);
    }
);

export default api;
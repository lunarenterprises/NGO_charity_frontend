import axios from 'axios';
import { BASE_URL } from './baseUrl';
import { showAlert } from '../Utils/alert';

const instance = axios.create({
    baseURL: BASE_URL,
    // IMPORTANT: Let browser send the HttpOnly cookies (like refreshToken) automatically
    withCredentials: true,
});

let isRefreshing = false;
let isLoggingOut = false; // Add flag to prevent multiple alerts
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// Helper to decide the right refresh endpoint dynamically based on path
const getRefreshUrl = () => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    return isAdmin ? `${BASE_URL}/api/admin/refresh-token` : `${BASE_URL}/api/user/refresh-token`;
};

// Helper to get auth data from the right key
const getAuthData = () => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    const key = isAdmin ? 'admin' : 'user';
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

const saveAccessToken = (token) => {
    const isAdmin = window.location.pathname.startsWith('/admin');
    const key = isAdmin ? 'admin' : 'user';
    try {
        const data = localStorage.getItem(key);
        if (data) {
            const parsed = JSON.parse(data);
            parsed.accessToken = token;
            localStorage.setItem(key, JSON.stringify(parsed));
        }
    } catch (e) {
        console.error("Failed to save refreshed token", e);
    }
};

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const auth = getAuthData();
        if (auth && auth.accessToken) {
            config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
    (response) => {
        // Return normal response
        return response;
    },
    async (error) => {
        const { config, response } = error;
        const originalRequest = config;

        // Soft failure checks or hard 401 check
        if (
            (response && response.status === 401) ||
            // Fallback for custom formatted messages
            (response?.data?.result === false &&
                (response?.data?.message?.toLowerCase().includes('token') ||
                    response?.data?.message?.toLowerCase().includes('ath-token') ||
                    response?.data?.message === "Missing Authentication Token"))
        ) {
            if (!originalRequest._retry) {
                return handleTokenRefresh(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

async function handleTokenRefresh(originalRequest) {
    if (!isRefreshing) {
        isRefreshing = true;
        try {
            // Make a post request to the refresh token endpoint. 
            // Important: using a new raw axios instance here to prevent interceptor loops!
            // 'withCredentials: true' is passed to ensure HttpOnly cookies are attached.
            const response = await axios.post(getRefreshUrl(), {}, {
                withCredentials: true
            });

            // Endpoint returns { data: { accessToken: "new_token" } }
            const payload = response.data;
            if (payload && payload.data && payload.data.accessToken) {
                const newToken = payload.data.accessToken;

                // Update frontend stored accessToken
                saveAccessToken(newToken);

                // Update default instance headers
                instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                // Resume suspended requests queue
                onRefreshed(newToken);
                isRefreshing = false;

                // Resume and retry original failed request
                originalRequest._retry = true;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return instance(originalRequest);
            } else {
                forceLogout();
                return Promise.reject(new Error("Refresh failed: No access token in response"));
            }
        } catch (err) {
            isRefreshing = false;
            forceLogout();
            return Promise.reject(err);
        }
    } else {
        // Queue the request if a refresh is already in progress
        return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
                originalRequest._retry = true;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(instance(originalRequest));
            });
        });
    }
}

function forceLogout() {
    if (isLoggingOut) return;
    isLoggingOut = true;

    const isAdmin = window.location.pathname.startsWith('/admin');
    
    // 1. Clear both local and session storage
    localStorage.removeItem(isAdmin ? 'admin' : 'user');
    sessionStorage.clear();
    
    // 2. Dispatch event for anything listening in React
    window.dispatchEvent(new Event('auth_logout'));

    // 3. Show alert and redirect on close
    showAlert('Session Expired', 'Your session has expired. Please login again to continue.', 'warning')
        .then(() => {
            // Adaptive redirect logic based on app side
            if (isAdmin && window.location.pathname !== '/admin/login') {
                window.location.href = '/admin/login';
            } else if (!isAdmin && window.location.pathname !== '/') {
                window.location.href = '/';
            } else {
                // If already on login/home, just reload to clear React state
                window.location.reload();
            }
        })
        .finally(() => {
            isLoggingOut = false;
        });
}

export default instance;

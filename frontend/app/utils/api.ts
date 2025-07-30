// src/app/utils/api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true, // BU KESİNLİKLE OLMALI VE VAR! Harika!
});

// Request interceptor'ı kaldırın
// Çünkü tokenlar HTTP-Only çerezlerde saklanıyor ve JavaScript tarafından erişilemez.
// Tarayıcı bu çerezleri 'withCredentials: true' sayesinde otomatik olarak gönderir.
/*
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token'); // Bu satır artık gereksiz
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Bu satır artık gereksiz
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
*/

// Response interceptor'ı kaldırın
// Token yenileme ve logout işlemleri artık backend tarafından çerezler üzerinden yönetilecek.
// Frontend'in refresh token'ı manuel olarak alıp saklamasına veya yeni access token'ı
// localStorage'a kaydetmesine gerek yok.
/*
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token'); // Bu satır artık gereksiz
            if (refreshToken) { // Bu blok artık gereksiz
                try {
                    const refreshResponse = await axios.post('http://localhost:5000/auth/refresh', {}, {
                        withCredentials: true,
                    });

                    const newAccessToken = refreshResponse.data.access_token; // Bu artık çerezde gelir, data objesinde olmaz
                    localStorage.setItem('access_token', newAccessToken); // Bu satır artık gereksiz

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Bu satır artık gereksiz

                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('Refresh token failed:', refreshError);
                    localStorage.removeItem('access_token'); // Bu satır artık gereksiz
                    localStorage.removeItem('refresh_token'); // Bu satır artık gereksiz
                    return Promise.reject(refreshError);
                }
            } else { // Bu blok artık gereksiz
                localStorage.removeItem('access_token'); // Bu satır artık gereksiz
                localStorage.removeItem('refresh_token'); // Bu satır artık gereksiz
            }
        }
        return Promise.reject(error);
    }
);
*/

export default api;
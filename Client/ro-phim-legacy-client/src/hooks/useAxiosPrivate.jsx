import { useEffect, useMemo } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const useAxiosPrivate = () => {
    const { auth, setAuth } = useAuth();

    const axiosAuth = useMemo(() => axios.create({
        baseURL: apiUrl,
        headers: { 'Content-Type': 'application/json' }
    }), []);

    useEffect(() => {

        const requestIntercept = axiosAuth.interceptors.request.use(
            config => {
                if (!config.headers['Authorization'] && auth?.token) {
                    config.headers['Authorization'] = `Bearer ${auth.token}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );


        let isRefreshing = false;
        let failedQueue = [];

        const processQueue = (error, token = null) => {
            failedQueue.forEach(prom => {
                if (error) prom.reject(error);
                else prom.resolve(token);
            });
            failedQueue = [];
        };

        const responseIntercept = axiosAuth.interceptors.response.use(
            response => response,
            async (error) => {
                const originalRequest = error.config;

                if (originalRequest.url.includes('/refresh')) {
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedQueue.push({ resolve, reject });
                        })
                            .then(token => {
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                                return axiosAuth(originalRequest);
                            })
                            .catch(err => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    isRefreshing = true;

                    return new Promise((resolve, reject) => {
                        // Gửi refresh_token lên để đổi lấy bộ token mới
                        axiosAuth.post('/refresh', {
                            refresh_token: auth?.refresh_token || auth?.refreshToken
                        })
                            .then(res => {
                                const newTokens = res.data;

                                // CẬP NHẬT CONTEXT VÀ LOCALSTORAGE
                                const updatedUser = { ...auth, token: newTokens.token, refreshToken: newTokens.refreshToken };
                                setAuth(updatedUser);
                                localStorage.setItem('user', JSON.stringify(updatedUser));

                                processQueue(null, newTokens.token);

                                originalRequest.headers['Authorization'] = `Bearer ${newTokens.token}`;
                                resolve(axiosAuth(originalRequest));
                            })
                            .catch(err => {
                                processQueue(err, null);
                                setAuth(null);
                                localStorage.removeItem('user');
                                reject(err);
                            })
                            .finally(() => isRefreshing = false);
                    });
                }
                return Promise.reject(error);
            }
        );

        // 3. CLEANUP: Xóa Interceptor cũ khi component unmount hoặc auth thay đổi
        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
            axiosAuth.interceptors.response.eject(responseIntercept);
        };
    }, [auth, setAuth]);

    return axiosAuth;
}

export default useAxiosPrivate;
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosPrivate.interceptors.request.use(
  (config) => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        // Kiểm tra xem token có tồn tại không
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error("Lỗi parse dữ liệu User từ localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
  (response) => {

    return response;
  },
  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userString = localStorage.getItem('user');
        if (!userString) throw new Error("Không tìm thấy User trong localStorage");

        const user = JSON.parse(userString);
        const rToken = user.refresh_token || user.refreshToken;

        if (!rToken) throw new Error("Không có Refresh Token");


        const response = await axios.post(`${API_BASE_URL}/refresh`, {
          refresh_token: rToken
        });

        const newTokens = response.data;
        user.token = newTokens.token;
        user.refresh_token = newTokens.refreshToken;
        localStorage.setItem('user', JSON.stringify(user));
        originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
        return axiosPrivate(originalRequest);

      } catch (refreshError) {

        console.error("Refresh Token thất bại, bắt buộc đăng nhập lại!", refreshError);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosPrivate;
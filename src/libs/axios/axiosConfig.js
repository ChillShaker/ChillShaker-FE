import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Tạo instance riêng cho refresh token
const axiosRefresh = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor cho axiosInstance chính
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const userInfo = JSON.parse(Cookies.get('userInfo') || '{}');
        const refreshToken = userInfo.refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API refresh token với body đúng format
        const response = await axiosRefresh.post('/refresh', JSON.stringify({
          refreshToken: refreshToken
        }));

        if (response?.data?.code === 200 && response.data.data) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Cập nhật tokens trong cookie
          const updatedUserInfo = { ...userInfo, refreshToken: newRefreshToken };
          Cookies.set('token', accessToken, { expires: 1 });
          Cookies.set('userInfo', JSON.stringify(updatedUserInfo), { expires: 1 });

          // Cập nhật header cho request gốc
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (err) {
        processQueue(err, null);
        // Xóa thông tin đăng nhập khi refresh thất bại
        Cookies.remove('token');
        Cookies.remove('userInfo');
        window.location.href = '/';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 
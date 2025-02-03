import axios from "axios";
import useAuthStore from "../hooks/useUserStore";

// Tạo instance axios không có interceptor cho refresh token
const axiosRefresh = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Instance chính với đầy đủ interceptor
const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Bỏ qua việc thêm token cho request refresh
    if (config.url === '/refresh') {
      return config;
    }
    
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userInfo = useAuthStore.getState().userInfo;
        
        if (!userInfo?.refreshToken) {
          useAuthStore.getState().logout();
          window.location.href = '/';
          return Promise.reject(error);
        }

        // Sử dụng axiosRefresh để gọi API refresh token
        const response = await axiosRefresh.post('/refresh', {
          refreshToken: userInfo.refreshToken
        });

        const { accessToken } = response.data.data;

        // Cập nhật token mới vào store
        useAuthStore.getState().updateToken(accessToken);

        // Cập nhật token mới vào header của request cũ
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        
        // Thực hiện lại request cũ với token mới
        return instance(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export { instance as default, axiosRefresh };
import { create } from "zustand";
import { logout } from "../services/AuthenService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const useAuthStore = create((set, get) => ({
  isLoggedIn: !!Cookies.get('token'),
  token: Cookies.get('token'),
  userInfo: (() => {
    const userInfoStr = Cookies.get('userInfo');
    try {
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch {
      return null;
    }
  })(),

  login: (token, userInfo) => {
    // Xóa tất cả cookies và session storage hiện tại
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    sessionStorage.clear();
    
    // Set cookies mới
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('userInfo', JSON.stringify(userInfo), { expires: 1 });

    // Update state
    set({
      isLoggedIn: true,
      token,
      userInfo
    });

    // Trigger storage event để sync across tabs
    window.dispatchEvent(new Event('storage'));
  },

  logout: () => {
    // Xóa tất cả cookies và session storage
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    sessionStorage.clear();
    
    // Reset state
    set({
      isLoggedIn: false,
      token: null,
      userInfo: null
    });

    // Trigger storage event để sync across tabs
    window.dispatchEvent(new Event('storage'));
  }
}));

export default useAuthStore;

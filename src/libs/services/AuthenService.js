import axios, { axiosRefresh } from "./axiosCustomize";

export const login = async (data) => {
  const response = await axios.post("/login", data);
  return response.data;
};

export const register = async (data) => {
  try {
    const response = await axios.post("/register", data);
    return response;
  } catch (error) {
    console.error('Register API Error:', error);
    throw error;
  }
};

export const verifyOtp = async (data) => {
  return await axios.post("/verify", data);
};

export const googleLogin = async (idToken) => {
  return await axios.post("/google-login", { idToken });
};

export const refreshToken = async (refreshToken) => {
  try {
    return await axiosRefresh.post("/refresh", {
      refreshToken: refreshToken
    });
  } catch (error) {
    throw error;
  }
};

export const logout = async (refreshToken) => {
  try {
    return await axios.post("/logout", JSON.stringify(refreshToken), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    throw error;
  }
};


export const resetPassword = async (email) => {
  try {
    return await axios.post("api/authen/reset-password", JSON.stringify(email), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    throw error;
  }
};

export const verifyResetPasswordOtp = async (data) => {
  try {
    return await axios.post("api/authen/reset-password/verification", JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    throw error;
  }
};

export const updatePassword = async (data) => {
  try {
    return await axios.post("api/authen/reset-password/new-password", JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    throw error;
  }
};


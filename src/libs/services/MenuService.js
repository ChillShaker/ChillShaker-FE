import axiosRefresh from "./axiosCustomize";

export const getMenus = async () => {
  try {
    const response = await axiosRefresh.get(`/menus`);
    return response.data; // API trả về { code: 200, data: [...] }
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw error;
  }
};
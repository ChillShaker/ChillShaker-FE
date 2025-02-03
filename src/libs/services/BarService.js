import axiosRefresh from "./axiosCustomize";

export const getBarDetail = async (barId = import.meta.env.VITE_DEFAULT_BAR_ID) => {
  const response = await axiosRefresh.get(`/bar/${barId}`);
  return response.data;
};


import axiosRefresh from "./axiosCustomize";

export const getDrinks = async (pageIndex = 1, pageSize = 4, q = '', attribute = 'name', sort = '') => {
  try {
    const params = {
      pageIndex: pageIndex - 1,
      pageSize
    };

    // Chỉ thêm params khi có giá trị
    if (q.trim()) {
      params.q = q.trim();
    }

    if (attribute && attribute !== 'name') {
      params.attribute = attribute;
    }

    // Chỉ gửi sort type (asc/desc)
    if (sort) {
      params.sort = sort; // Chỉ gửi 'asc' hoặc 'desc'
    }

    const response = await axiosRefresh.get(`/drinks`, { params });
    return response.data;
  } catch (error) {
    console.error('Error in getDrinks:', error);
    throw error;
  }
};


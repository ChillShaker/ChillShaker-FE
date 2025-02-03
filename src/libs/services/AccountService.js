import { axiosCustomize } from "./indes";

export const getMyProfile = async () => {
  const response = await axiosCustomize.get('/account-information');
  return response;
};

export const updateProfile = async (data) => {
  const response = await axiosCustomize.put('/account-information', data);
  return response;
};
  
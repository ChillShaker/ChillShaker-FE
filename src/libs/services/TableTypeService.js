import axios from "./axiosCustomize";

export const getTableTypes = async () => {
  const response = await axios.get('/table-types')
  return response.data
}

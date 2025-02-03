import axios from "./axiosCustomize";

export const getBarTableByDateAndTime = (date, time) => {
    return axios.get(`/bar-tables/date-time?booking-date=${date}&booking-time=${time}`);
}

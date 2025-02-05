import axiosCustomize from "./axiosCustomize";

export const bookingTableOnly = (bookingRequest) => {
    return axiosCustomize.post('/booking-only-table', {
        barName: "Chill Shaker Bar",
        bookingDate: bookingRequest.bookingDate,
        bookingTime: bookingRequest.bookingTime,
        note: bookingRequest.note,
        totalPrice: bookingRequest.totalPrice,
        numberOfPeople: bookingRequest.numberOfPeople,
        tableIds: bookingRequest.tableIds
    });
}

export const getPaymentStatus = (responseCode, transactionNo) => {
    return axiosCustomize.get('/payment-status', {
        params: {
            responseCode,
            transactionNo
        }
    });
};

export const getBookingInfo = async (bookingId) => {
    const response = await axiosCustomize.get(`/booking-info/${bookingId}`);
    return response;
};

export const bookingTableWithDrinks = (bookingRequest) => {
    // Validate và format dữ liệu trước khi gửi
    const formattedRequest = {
        barName: "Chill Shaker Bar",
        bookingDate: bookingRequest.bookingDate,
        bookingTime: bookingRequest.bookingTime,
        note: bookingRequest.note || "Booking with drinks",
        totalPrice: parseFloat(bookingRequest.totalPrice),
        numberOfPeople: parseInt(bookingRequest.numberOfPeople),
        tableIds: bookingRequest.tableIds,
        drinks: bookingRequest.drinks.map(drink => ({
            drinkId: drink.drinkId || drink.id,
            quantity: parseInt(drink.quantity)
        }))
    };

    // Log request để debug
    console.log('Final request to API:', JSON.stringify(formattedRequest, null, 2));

    return axiosCustomize.post('/booking-table-with-drink', formattedRequest);
}

export const bookingTableWithMenu = (bookingRequest) => {
    // Validate và format dữ liệu trước khi gửi
    const formattedRequest = {
        barName: "Chill Shaker Bar",
        bookingDate: bookingRequest.bookingDate,
        bookingTime: bookingRequest.bookingTime,
        note: bookingRequest.note || "Booking with menu",
        totalPrice: parseFloat(bookingRequest.totalPrice),
        numberOfPeople: parseInt(bookingRequest.numberOfPeople),
        tableIds: bookingRequest.tableIds,
        menuId: bookingRequest.menuId // Thêm menuId cho booking với menu
    };

    // Log request để debug
    console.log('Booking with menu request:', JSON.stringify(formattedRequest, null, 2));

    // Gọi API endpoint booking-table-with-menu
    return axiosCustomize.post('/booking-table-with-menu', formattedRequest);
};

export const getAllBookingByDateTime = async () => {
    const response = await axiosCustomize.get('/booking-list');
    return response;
};

/**
 * Lấy danh sách booking theo ngày và giờ
 * @param {Date} bookingDate - Ngày booking
 * @param {string} bookingTime - Giờ booking (format: HH:mm)
 * @returns {Promise} Promise object chứa response từ API
 */
export const getBookingsByDateTime = async (bookingDate, bookingTime) => {
    try {
        // Format date thành YYYY-MM-DD
        const formattedDate = bookingDate instanceof Date 
            ? bookingDate.toISOString().split('T')[0]
            : bookingDate;

        // Format time thành HH:mm
        const formattedTime = bookingTime instanceof Date
            ? `${bookingTime.getHours().toString().padStart(2, '0')}:${bookingTime.getMinutes().toString().padStart(2, '0')}`
            : bookingTime;

        const response = await axiosCustomize.get('/booking/date-time', {
            params: {
                'booking-date': formattedDate,
                'booking-time': formattedTime
            }
        });

        // Kiểm tra và transform dữ liệu nếu cần
        if (response?.data?.code === 200) {
            const bookings = response.data.data;
            
            return bookings;
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw new Error(error?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu đặt bàn');
    }
};

// Ví dụ sử dụng:
// const bookings = await getBookingsByDateTime(new Date(), "19:00");

/**
 * Cập nhật trạng thái booking
 * @param {string} bookingId - ID của booking
 * @param {string} status - Trạng thái mới (PENDING/SERVING/COMPLETED/CANCELED)
 * @returns {Promise} Promise object chứa response từ API
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await axiosCustomize.put(`/booking-status/${status}/${bookingId}`, {
      status: status
    });
    return response;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

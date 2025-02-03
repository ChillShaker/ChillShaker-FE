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


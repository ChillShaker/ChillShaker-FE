import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  IconButton,
  TablePagination,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format, addDays } from 'date-fns';
import { getBookingsByDateTime } from 'src/libs/services/BookingService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Styled Components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: theme.palette.common.white,
  borderBottom: '1px solid rgba(155, 81, 224, 0.2)',
}));

const StyledTableRow = styled(TableRow)({
  '&:hover': {
    backgroundColor: 'rgba(155, 81, 224, 0.1)',
  },
});

const StatusChip = styled(Chip)(({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'PENDING': return { bg: '#FFA500', color: '#000' };
      case 'CONFIRMED': return { bg: '#4CAF50', color: '#fff' };
      case 'CANCELLED': return { bg: '#f44336', color: '#fff' };
      case 'COMPLETED': return { bg: '#2196F3', color: '#fff' };
      default: return { bg: '#757575', color: '#fff' };
    }
  };

  const { bg, color } = getStatusColor();
  return {
    backgroundColor: bg,
    color: color,
    fontWeight: 600,
  };
});

const BookingManagementPage = () => {
  // Tạo mảng các khung giờ từ 9:00 đến 23:00
  const timeSlots = Array.from({ length: 15 }, (_, index) => {
    const hour = index + 9;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Hàm lấy giờ gần nhất từ thời gian hiện tại
  const getNearestTimeSlot = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Nếu thời gian hiện tại < 9:00, trả về 09:00
    if (currentHour < 9) return '09:00';
    
    // Nếu thời gian hiện tại > 23:00, trả về 09:00 của ngày hôm sau
    if (currentHour >= 23) {
      const tomorrow = addDays(now, 1);
      return {
        date: format(tomorrow, 'yyyy-MM-dd'),
        time: '09:00'
      };
    }
    
    // Tìm giờ gần nhất trong timeSlots
    const nearestSlot = timeSlots.find(slot => {
      const slotHour = parseInt(slot.split(':')[0]);
      return slotHour >= currentHour;
    });

    return {
      date: format(now, 'yyyy-MM-dd'),
      time: nearestSlot || '09:00'
    };
  };

  // Khởi tạo states
  const initialTimeSlot = getNearestTimeSlot();
  const [selectedDate, setSelectedDate] = useState(initialTimeSlot.date);
  const [selectedTime, setSelectedTime] = useState(initialTimeSlot.time);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  // Effect để tự động cập nhật giờ khi component mount
  useEffect(() => {
    const timeSlot = getNearestTimeSlot();
    setSelectedDate(timeSlot.date);
    setSelectedTime(timeSlot.time);
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookingsByDateTime(selectedDate, selectedTime);
      setBookings(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedTime]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/staff/booking-info/${bookingId}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#9b51e0', fontWeight: 600, mb: 2 }}>
          Quản lý Booking
        </Typography>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TextField
          type="date"
          label="Ngày"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              color: 'white',
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        />

        {/* Thay thế TextField time bằng Select */}
        <Select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          displayEmpty
          sx={{
            width: 200,
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9b51e0',
            },
            '& .MuiSelect-icon': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        >
          <MenuItem disabled value="">
            <em>Chọn giờ</em>
          </MenuItem>
          {timeSlots.map((time) => (
            <MenuItem 
              key={time} 
              value={time}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(155, 81, 224, 0.1)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(155, 81, 224, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(155, 81, 224, 0.3)',
                  },
                },
              }}
            >
              {time}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchBookings}
          sx={{
            bgcolor: 'rgba(155, 81, 224, 0.1)',
            '&:hover': { bgcolor: 'rgba(155, 81, 224, 0.2)' },
          }}
        >
          Làm mới
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Mã Booking</StyledTableCell>
              <StyledTableCell>Ngày</StyledTableCell>
              <StyledTableCell>Giờ</StyledTableCell>
              <StyledTableCell>Số bàn</StyledTableCell>
              <StyledTableCell>Tổng tiền</StyledTableCell>
              <StyledTableCell>Trạng thái</StyledTableCell>
              <StyledTableCell align="center">Thao tác</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((booking) => (
                <StyledTableRow key={booking.id}>
                  <StyledTableCell>{booking.bookingCode}</StyledTableCell>
                  <StyledTableCell>
                    {format(new Date(booking.bookingDate), 'dd/MM/yyyy')}
                  </StyledTableCell>
                  <StyledTableCell>{booking.bookingTime}</StyledTableCell>
                  <StyledTableCell>
                    {booking.bookingTables?.length || 0}
                  </StyledTableCell>
                  <StyledTableCell>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(booking.totalPrice)}
                  </StyledTableCell>
                  <StyledTableCell>
                    <StatusChip
                      label={booking.status}
                      status={booking.status}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      onClick={() => handleViewDetails(booking.id)}
                      sx={{ color: '#9b51e0' }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={bookings.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ color: 'white' }}
        />
      </TableContainer>
    </Box>
  );
};

export default BookingManagementPage;

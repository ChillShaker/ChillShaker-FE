import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { getBookingInfo, updateBookingStatus } from 'src/libs/services/BookingService';
import { toast } from 'react-toastify';
import webSocketService from 'src/libs/web-socket/web-socket';

const InfoSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '12px',
  height: '100%',
}));

const InfoLabel = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.7)',
  fontWeight: 500,
  marginBottom: '8px',
});

const InfoValue = styled(Typography)({
  color: 'white',
  fontWeight: 600,
  marginBottom: '16px',
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

// Định nghĩa các trạng thái có thể có
const BOOKING_STATUSES = {
  PENDING: { label: 'Chờ xử lý', color: '#FFA500' },
  SERVING: { label: 'Đang phục vụ', color: '#2196F3' },
  COMPLETED: { label: 'Hoàn thành', color: '#4CAF50' },
  CANCELED: { label: 'Đã hủy', color: '#f44336' },
};

const BookingInfoPageForStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        setLoading(true);
        const response = await getBookingInfo(id);
        if (response?.data?.code === 200) {
          setBooking(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Không thể tải thông tin booking');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingInfo();
    }
  }, [id]);

  useEffect(() => {
    // Lắng nghe event từ lính gác
    const handleBookingUpdate = (event) => {
      const updatedBooking = event.detail;
      if (updatedBooking.id === id) {
        console.log('Received booking update from guard:', updatedBooking);
        setBooking(updatedBooking);
        toast.success('Trạng thái booking đã được cập nhật');
      }
    };

    // Đăng ký lắng nghe
    window.addEventListener('bookingStatusUpdated', handleBookingUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('bookingStatusUpdated', handleBookingUpdate);
    };
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await updateBookingStatus(booking.id, newStatus);
      if (response?.data?.code === 200) {
        // Vẫn update UI ngay lập tức để UX tốt hơn
        setBooking(prev => ({
          ...prev,
          status: newStatus
        }));
        toast.success('Đã gửi yêu cầu cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#9b51e0' }} />
      </Box>
    );
  }

  if (!booking) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Không tìm thấy thông tin đặt bàn
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#9b51e0' }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" sx={{ color: '#9b51e0', fontWeight: 600 }}>
          Chi tiết Booking
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Thông tin cơ bản */}
        <Grid item xs={12} md={6}>
          <InfoSection>
            <Typography variant="h6" sx={{ color: '#9b51e0', mb: 3 }}>
              Thông tin đặt bàn
            </Typography>
            
            <InfoLabel>Mã Booking</InfoLabel>
            <InfoValue>{booking.bookingCode}</InfoValue>

            <InfoLabel>Ngày đặt</InfoLabel>
            <InfoValue>{format(new Date(booking.bookingDate), 'dd/MM/yyyy')}</InfoValue>

            <InfoLabel>Giờ đặt</InfoLabel>
            <InfoValue>{booking.bookingTime?.slice(0, 5)}</InfoValue>

            <InfoLabel>Trạng thái</InfoLabel>
            <Box sx={{ mb: 2 }}>
              <FormControl 
                fullWidth
                sx={{
                  maxWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(155, 81, 224, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9b51e0',
                    },
                  },
                  '& .MuiSelect-icon': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                <Select
                  value={booking.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {Object.entries(BOOKING_STATUSES).map(([status, { label, color }]) => (
                    <MenuItem 
                      key={status} 
                      value={status}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: `${color}20`,
                        },
                        '&:hover': {
                          backgroundColor: `${color}10`,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: color,
                          }}
                        />
                        {label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Hiển thị chip trạng thái hiện tại */}
              <Box sx={{ mt: 1 }}>
                <StatusChip 
                  label={BOOKING_STATUSES[booking.status]?.label || booking.status} 
                  status={booking.status}
                />
              </Box>
            </Box>

            <InfoLabel>Tổng tiền</InfoLabel>
            <InfoValue>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(booking.totalPrice)}
            </InfoValue>

            <InfoLabel>Thời gian hết hạn</InfoLabel>
            <InfoValue>
              {booking.expireAt ? format(new Date(booking.expireAt), 'HH:mm dd/MM/yyyy') : 'N/A'}
            </InfoValue>

            <InfoLabel>Ghi chú</InfoLabel>
            <InfoValue>{booking.note || 'Không có ghi chú'}</InfoValue>
          </InfoSection>
        </Grid>

        {/* Thông tin bàn và thanh toán */}
        <Grid item xs={12} md={6}>
          <InfoSection>
            <Typography variant="h6" sx={{ color: '#9b51e0', mb: 3 }}>
              Chi tiết bàn và thanh toán
            </Typography>

            {/* Danh sách bàn */}
            <InfoLabel>Bàn đã đặt</InfoLabel>
            <Box sx={{ mb: 3 }}>
              {booking.bookingTables?.map((bookingTable) => (
                <Box 
                  key={bookingTable.barTable.id}
                  sx={{ 
                    mb: 2,
                    p: 2,
                    bgcolor: 'rgba(155, 81, 224, 0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(155, 81, 224, 0.2)'
                  }}
                >
                  <Typography sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                    {bookingTable.barTable.name}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Loại: {bookingTable.barTable.tableType.name}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Sức chứa: {bookingTable.barTable.tableType.capacity} người
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Đặt cọc: {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(bookingTable.barTable.tableType.depositAmount)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

            {/* Thông tin thanh toán */}
            <InfoLabel>Thông tin thanh toán</InfoLabel>
            <Box sx={{ color: 'white' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Trạng thái
                  </Typography>
                  <StatusChip 
                    label={booking.payment?.status || 'N/A'} 
                    status={booking.payment?.status} 
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Ngày thanh toán
                  </Typography>
                  <Typography>
                    {booking.payment?.paymentDate ? 
                      format(new Date(booking.payment.paymentDate), 'dd/MM/yyyy') : 
                      'Chưa thanh toán'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Mã giao dịch
                  </Typography>
                  <Typography>
                    {booking.payment?.transactionCode || 'Chưa có'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    Tổng tiền thanh toán
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#9b51e0' }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(booking.payment?.totalPrice || 0)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </InfoSection>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingInfoPageForStaff;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Divider,
  Button,
} from '@mui/material';
import styled from '@emotion/styled';
import { getBookingInfo } from 'src/libs/services/BookingService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import TableBarIcon from '@mui/icons-material/TableBar';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import InfoIcon from '@mui/icons-material/Info';
import TimerIcon from '@mui/icons-material/Timer';
import PaymentIcon from '@mui/icons-material/Payment';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Styled Components
const InfoCard = styled(Paper)({
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  backdropFilter: 'blur(12px)',
  borderRadius: '16px',
  border: '1px solid rgba(155, 81, 224, 0.2)',
  padding: '24px',
  color: 'white',
});

const InfoItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
  '& .MuiSvgIcon-root': {
    color: '#9b51e0',
  },
});

const TableTypeCard = styled(Box)({
  backgroundColor: 'rgba(155, 81, 224, 0.1)',
  borderRadius: '12px',
  border: '1px solid rgba(155, 81, 224, 0.2)',
  padding: '16px',
  marginTop: '24px',
});

// Thêm hàm helper để kiểm tra và format date
const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch (error) {
    console.error('Invalid date:', dateString);
    return 'N/A';
  }
};

// Thêm hàm helper để format time
const formatTime = (timeString) => {
  try {
    if (!timeString) return 'N/A';
    // Chỉ lấy phần giờ:phút từ chuỗi time
    return timeString.substring(0, 5);
  } catch (error) {
    console.error('Invalid time:', timeString);
    return 'N/A';
  }
};

const BookingInfoPage = () => {
  const { id } = useParams();
  const [bookingInfo, setBookingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingInfo();
  }, [id]);

  const fetchBookingInfo = async () => {
    try {
      const response = await getBookingInfo(id);
      setBookingInfo(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking info:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: '#ffa726',
      CONFIRMED: '#66bb6a',
      CANCELLED: '#ef5350',
      COMPLETED: '#42a5f5'
    };
    return statusColors[status] || '#9e9e9e';
  };

  const getPaymentStatusInfo = (status) => {
    if (!status) return {
      color: '#ffa726',
      icon: <PendingIcon />,
      text: 'Chưa thanh toán'
    };

    switch (status) {
      case 'PENDING':
        return {
          color: '#ffa726',
          icon: <PendingIcon />,
          text: 'Đang xử lý'
        };
      case 'SUCCESS':
        return {
          color: '#66bb6a',
          icon: <CheckCircleIcon />,
          text: 'Thành công'
        };
      case 'FAIL':
        return {
          color: '#ef5350',
          icon: <CancelIcon />,
          text: 'Thất bại'
        };
      default:
        return {
          color: '#9e9e9e',
          icon: <PendingIcon />,
          text: 'Không xác định'
        };
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '60vh',
          gap: 2
        }}
      >
        <CircularProgress sx={{ color: '#9b51e0' }} />
        <Typography sx={{ color: 'white' }}>
          Đang tải thông tin...
        </Typography>
      </Box>
    );
  }

  if (!bookingInfo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            backgroundColor: 'rgba(20, 20, 20, 0.8)',
            backdropFilter: 'blur(12px)',
            borderRadius: '16px',
            border: '1px solid rgba(155, 81, 224, 0.2)',
            p: 4,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              mb: 2,
              textAlign: 'center'
            }}
          >
            Không tìm thấy đơn đặt bàn
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{
              mt: 2,
              backgroundColor: 'rgba(155, 81, 224, 0.8)',
              '&:hover': {
                backgroundColor: '#9b51e0',
              }
            }}
          >
            Quay lại
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{
          color: '#9b51e0',
          fontWeight: 600,
          mb: 4,
          textAlign: 'center'
        }}
      >
        Chi tiết đặt bàn
      </Typography>

      <Grid container spacing={3}>
        {/* Thông tin đặt bàn */}
        <Grid item xs={12} md={8}>
          <InfoCard>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: '#9b51e0' }}>
                Mã đặt bàn: {bookingInfo?.bookingCode}
              </Typography>
              <Chip
                label={bookingInfo?.status}
                sx={{
                  backgroundColor: getStatusColor(bookingInfo?.status),
                  color: 'white',
                }}
              />
            </Box>

            <Divider sx={{ borderColor: 'rgba(155, 81, 224, 0.2)', mb: 3 }} />

            <InfoItem>
              <EventIcon />
              <Typography>
                Ngày đặt: {formatDate(bookingInfo?.bookingDate)}
              </Typography>
            </InfoItem>

            <InfoItem>
              <AccessTimeIcon />
              <Typography>
                Giờ đặt: {formatTime(bookingInfo?.bookingTime)}
              </Typography>
            </InfoItem>

            <InfoItem>
              <GroupIcon />
              <Typography>
                Số người: {bookingInfo?.numberOfPeople} người
              </Typography>
            </InfoItem>

            <InfoItem>
              <TableBarIcon />
              <Typography>
                Bàn đã đặt: {bookingInfo?.bookingTables.map(table => table.barTable.name).join(', ')}
              </Typography>
            </InfoItem>

            {bookingInfo?.expireAt && (
              <InfoItem>
                <TimerIcon />
                <Typography>
                  Hết hạn: {formatDate(bookingInfo.expireAt)} {formatTime(bookingInfo.expireAt)}
                </Typography>
              </InfoItem>
            )}

            {bookingInfo?.note && (
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Ghi chú:
                </Typography>
                <Typography sx={{ 
                  backgroundColor: 'rgba(155, 81, 224, 0.1)',
                  p: 2,
                  borderRadius: '8px',
                  border: '1px solid rgba(155, 81, 224, 0.2)'
                }}>
                  {bookingInfo.note}
                </Typography>
              </Box>
            )}
          </InfoCard>
        </Grid>

        {/* Thông tin thanh toán */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <ReceiptLongIcon sx={{ color: '#9b51e0' }} />
              <Typography variant="h6" sx={{ color: '#9b51e0' }}>
                Thông tin thanh toán
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(155, 81, 224, 0.2)', mb: 3 }} />

            {/* Trạng thái thanh toán */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              mb: 3,
              backgroundColor: 'rgba(155, 81, 224, 0.1)',
              p: 2,
              borderRadius: '8px',
            }}>
              <PaymentIcon sx={{ color: '#9b51e0' }} />
              <Box>
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Trạng thái thanh toán
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  mt: 0.5
                }}>
                  {(() => {
                    const status = getPaymentStatusInfo(bookingInfo?.payment?.status);
                    return (
                      <>
                        {React.cloneElement(status.icon, { sx: { color: status.color } })}
                        <Typography sx={{ color: status.color, fontWeight: 500 }}>
                          {status.text}
                        </Typography>
                      </>
                    );
                  })()}
                </Box>
              </Box>
            </Box>

            {/* Thông tin loại bàn */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Loại bàn:
              </Typography>
              <Typography sx={{ fontWeight: 500 }}>
                {bookingInfo?.bookingTables[0].barTable.tableType.name}
              </Typography>
            </Box>

            {/* Tiền đặt cọc */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Tiền đặt cọc:
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {bookingInfo?.payment?.totalPrice.toLocaleString()}đ
              </Typography>
            </Box>

            {/* Ngày thanh toán */}
            {bookingInfo?.payment?.paymentDate && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                mb: 2
              }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Ngày thanh toán:
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {formatDate(bookingInfo.payment.paymentDate)}
                </Typography>
              </Box>
            )}

            {/* Tổng tiền */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              backgroundColor: 'rgba(155, 81, 224, 0.1)',
              p: 2,
              borderRadius: '8px',
              mt: 3
            }}>
              <Typography sx={{ fontWeight: 600 }}>
                Tổng tiền:
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#9b51e0' }}>
                {bookingInfo?.payment?.totalPrice.toLocaleString()}đ
              </Typography>
            </Box>
          </InfoCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookingInfoPage;

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';
import dayjs from 'dayjs';
import { getPaymentStatus } from '../../../libs/services/BookingService';

// Styled components
const SuccessContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  padding: '40px 20px',
});

const SuccessCard = styled(Paper)({
  backgroundColor: 'rgba(20, 20, 20, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(76, 175, 80, 0.3)',
  borderRadius: '16px',
  padding: '32px',
  maxWidth: '600px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
});

const SuccessIcon = styled(CheckCircleIcon)({
  fontSize: '80px',
  color: '#4CAF50',
  marginBottom: '24px',
});

const BookingInfo = styled(Box)({
  backgroundColor: 'rgba(76, 175, 80, 0.1)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid rgba(76, 175, 80, 0.2)',
});

const ActionButton = styled(Button)(({ variant }) => ({
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  textTransform: 'none',
  margin: '8px',
  ...(variant === 'contained' && {
    backgroundColor: '#4CAF50',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  }),
  ...(variant === 'outlined' && {
    borderColor: '#4CAF50',
    color: '#4CAF50',
    '&:hover': {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderColor: '#4CAF50',
    },
  }),
}));

const InfoRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  '&:last-child': {
    borderBottom: 'none',
  },
});

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        // Lấy vnp_ResponseCode và vnp_TransactionNo từ URL
        const searchParams = new URLSearchParams(location.search);
        const responseCode = searchParams.get('vnp_ResponseCode');
        const transactionNo = searchParams.get('vnp_TransactionNo');

        // Gọi API để lấy thông tin chi tiết
        const response = await getPaymentStatus(responseCode, transactionNo);
        
        if (response.data?.code === 200) {
          setPaymentInfo(response.data.data);
        } else {
          // Redirect to error page if payment failed
          navigate('/payment-error');
        }
      } catch (error) {
        console.error('Error fetching payment info:', error);
        navigate('/payment-error');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [location]);

  // Format số tiền thành dạng VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const handleViewBooking = () => {
    navigate('/booking-history');
  };

  const handleBackHome = () => {
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!paymentInfo) {
    return <div>Loading...</div>;
  }

  return (
    <SuccessContainer>
      <SuccessCard>
        <SuccessIcon />
        <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
          Thanh toán thành công!
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
          Cảm ơn bạn đã đặt bàn tại Chill Shaker Bar
        </Typography>

        <BookingInfo>
          <InfoRow>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Mã giao dịch:
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
              {paymentInfo.transactionCode}
            </Typography>
          </InfoRow>

          <InfoRow>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Nhà cung cấp:
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
              {paymentInfo.providerName}
            </Typography>
          </InfoRow>

          <InfoRow>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Ngày thanh toán:
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
              {formatDate(paymentInfo.paymentDate)}
            </Typography>
          </InfoRow>

          <InfoRow>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Email:
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
              {paymentInfo.email}
            </Typography>
          </InfoRow>

          <InfoRow>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Phí giao dịch:
            </Typography>
            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
              {formatCurrency(paymentInfo.paymentFee)} VNĐ
            </Typography>
          </InfoRow>

          <InfoRow>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Tổng tiền thanh toán:
            </Typography>
            <Typography sx={{ color: '#4CAF50', fontWeight: 600 }}>
              {formatCurrency(paymentInfo.totalPrice)} VNĐ
            </Typography>
          </InfoRow>

          {paymentInfo.note && (
            <InfoRow>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Ghi chú:
              </Typography>
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                {paymentInfo.note}
              </Typography>
            </InfoRow>
          )}
        </BookingInfo>

        <Box sx={{ mt: 3 }}>
          <ActionButton
            variant="contained"
            startIcon={<ReceiptLongIcon />}
            onClick={handleViewBooking}
          >
            Xem đơn đặt bàn
          </ActionButton>
          <ActionButton
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleBackHome}
          >
            Về trang chủ
          </ActionButton>
        </Box>
      </SuccessCard>
    </SuccessContainer>
  );
};

export default PaymentSuccess;

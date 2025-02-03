import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Styled components
const ErrorContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  padding: '40px 20px',
});

const ErrorCard = styled(Paper)({
  backgroundColor: 'rgba(20, 20, 20, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(244, 67, 54, 0.3)',
  borderRadius: '16px',
  padding: '32px',
  maxWidth: '600px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
});

const ErrorIcon = styled(ErrorOutlineIcon)({
  fontSize: '80px',
  color: '#f44336',
  marginBottom: '24px',
});

const MessageBox = styled(Box)({
  backgroundColor: 'rgba(244, 67, 54, 0.1)',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid rgba(244, 67, 54, 0.2)',
});

const ActionButton = styled(Button)(({ variant }) => ({
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  textTransform: 'none',
  margin: '8px',
  ...(variant === 'contained' && {
    backgroundColor: '#f44336',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  }),
  ...(variant === 'outlined' && {
    borderColor: '#f44336',
    color: '#f44336',
    '&:hover': {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderColor: '#f44336',
    },
  }),
}));

const PaymentError = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate('/booking/tables'); // Điều hướng về trang đặt bàn
  };

  const handleBackHome = () => {
    navigate('/'); // Điều hướng về trang chủ
  };

  return (
    <ErrorContainer>
      <ErrorCard>
        <ErrorIcon />
        <Typography variant="h4" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
          Thanh toán thất bại!
        </Typography>
        <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
          Rất tiếc, giao dịch của bạn không thể hoàn tất
        </Typography>

        <MessageBox>
          <Typography sx={{ color: '#fff', mb: 2 }}>
            Có thể do một trong các nguyên nhân sau:
          </Typography>
          <Box sx={{ textAlign: 'left', pl: 2 }}>
            <Typography 
              component="li" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 1 
              }}
            >
              Thẻ/Tài khoản của bạn không đủ số dư
            </Typography>
            <Typography 
              component="li" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 1 
              }}
            >
              Thông tin thanh toán không chính xác
            </Typography>
            <Typography 
              component="li" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 1 
              }}
            >
              Lỗi kết nối trong quá trình xử lý
            </Typography>
          </Box>
        </MessageBox>

        <Typography 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 3,
            fontSize: '0.9rem' 
          }}
        >
          Vui lòng thử lại hoặc chọn phương thức thanh toán khác
        </Typography>

        <Box sx={{ mt: 3 }}>
          <ActionButton
            variant="contained"
            startIcon={<RestartAltIcon />}
            onClick={handleTryAgain}
          >
            Thử lại
          </ActionButton>
          <ActionButton
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={handleBackHome}
          >
            Về trang chủ
          </ActionButton>
        </Box>
      </ErrorCard>
    </ErrorContainer>
  );
};

export default PaymentError;

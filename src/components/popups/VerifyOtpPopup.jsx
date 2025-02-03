import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import { verifyOtp } from '../../libs/services/AuthenService';
import { toast } from 'react-toastify';

const OtpInput = styled('input')({
  width: '40px',
  height: '40px',
  padding: '0',
  margin: '0 4px',
  textAlign: 'center',
  fontSize: '18px',
  fontWeight: '500',
  color: 'white',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(155, 81, 224, 0.3)',
  borderRadius: '8px',
  outline: 'none',
  transition: 'all 0.3s ease',
  '&:focus': {
    borderColor: '#9b51e0',
    boxShadow: '0 0 0 2px rgba(155, 81, 224, 0.2)',
  },
  '&:hover': {
    borderColor: 'rgba(155, 81, 224, 0.5)',
  },
});

const VerifyOtpPopup = ({ open, onClose, onSwitchToSignin, email }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [open]);

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^[0-9]{1,6}$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      if (pastedData.length === 6) {
        inputRefs.current[5].focus();
      } else {
        inputRefs.current[pastedData.length].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP!');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtp({
        email: email,
        otp: otpString
      });

      if (response.status === 200) {
        toast.success('Xác thực thành công!');
        onClose();
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => {
          onSwitchToSignin();
        }, 300);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã OTP không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionProps={{
        timeout: 300,
        enter: true,
        exit: true,
      }}
      PaperProps={{
        style: {
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          backgroundImage: 'linear-gradient(rgba(155, 81, 224, 0.1) 0%, rgba(0, 0, 0, 0.1) 100%)',
          animation: open ? 'fadeIn 0.3s ease-out' : 'none',
          maxWidth: '450px',
          width: '95%',
          margin: 'auto',
        },
      }}
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: '16px', sm: '32px' },
          overflowY: 'visible',
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ 
          p: { xs: 1.5, sm: 2.5 },
          width: '100%' 
        }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: { xs: 1.5, sm: 2 },
            position: 'relative'
          }}>
            <IconButton
              onClick={onClose}
              sx={{ 
                color: '#9b51e0',
                mr: 1,
                padding: { xs: '4px', sm: '8px' },
                '&:hover': { 
                  background: 'rgba(155, 81, 224, 0.1)' 
                }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#9b51e0', 
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Nhập OTP
            </Typography>
          </Box>

          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              mb: 3,
              textAlign: 'center'
            }}
          >
            OTP sẽ được gửi qua email bạn đã đăng ký
          </Typography>

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              gap: 1,
              mb: 3
            }}>
              {otp.map((digit, index) => (
                <OtpInput
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  maxLength={1}
                  autoComplete="off"
                />
              ))}
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="gradient-button"
              disabled={loading}
              sx={{
                py: { xs: 0.8, sm: 1.2 },
                borderRadius: '25px',
                textTransform: 'none',
                fontSize: { xs: '14px', sm: '16px' },
                mb: 2
              }}
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography
                component="span"
                onClick={onSwitchToSignin}
                sx={{
                  color: '#9b51e0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Đăng nhập
              </Typography>
            </Box>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyOtpPopup;

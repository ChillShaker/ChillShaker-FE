import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  InputAdornment,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GoogleIcon from '@mui/icons-material/Google';
import { styled } from '@mui/material/styles';
import { register } from '../../libs/services/AuthenService';
import { toast } from 'react-toastify';

const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    height: '40px',
    '& fieldset': {
      borderColor: 'rgba(155, 81, 224, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(155, 81, 224, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9b51e0',
    },
    '& input': {
      padding: '8px 14px',
      fontSize: '14px',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    transform: 'translate(14px, 10px) scale(1)',
    '&.Mui-focused': {
      color: '#9b51e0',
    },
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -7px) scale(0.75)',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '13px',
  },
});

const SignupPopup = ({ open, onClose, onSwitchToLogin, onOpenVerifyOtp }) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không khớp!');
      return;
    }

    try {
      setLoading(true);
      const response = await register({
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        phone: formData.phone
      });

      // Log để debug
      console.log('Register Response:', response);

      // Kiểm tra response chi tiết hơn
      if (response?.data) {
        toast.success('Đăng ký thành công! Vui lòng xác thực email.');
        
        onClose();
        
        onOpenVerifyOtp(formData.email);
        
        // Reset form
        setFormData({
          email: '',
          fullName: '',
          password: '',
          confirmPassword: '',
          phone: '',
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Register Error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký!');
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
              Đăng ký
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 1.2, sm: 1.5 },
            }}>
              <CustomTextField
                label="Địa chỉ Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                placeholder="nguyenvana@gmail.com"
              />

              <CustomTextField
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
                placeholder="nguyenvana"
              />

              <CustomTextField
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                placeholder="••••••••"
              />

              <CustomTextField
                label="Nhập lại mật khẩu"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                fullWidth
                required
                placeholder="••••••••"
              />

              <CustomTextField
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
                placeholder="123123123"
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="gradient-button"
                disabled={loading}
                sx={{
                  mt: { xs: 0.5, sm: 1 },
                  py: { xs: 0.8, sm: 1.2 },
                  borderRadius: '25px',
                  textTransform: 'none',
                  fontSize: { xs: '14px', sm: '16px' },
                }}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </Button>

              <Box sx={{ textAlign: 'center', color: 'white', my: 0.8 }}>
                <Typography component="span" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  hoặc
                </Typography>
              </Box>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(155, 81, 224, 0.5)',
                  borderRadius: '25px',
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#9b51e0',
                    backgroundColor: 'rgba(155, 81, 224, 0.1)',
                  },
                }}
              >
                Đăng nhập với Google
              </Button>

              <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                <Typography 
                  component="span" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px'
                  }}
                >
                  Bạn đã có tài khoản?{' '}
                </Typography>
                <Typography
                  component="span"
                  onClick={onSwitchToLogin}
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

              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  textAlign: 'center',
                  fontSize: '11px',
                  mt: 0.8
                }}
              >
                Bằng cách đăng ký hoặc đăng nhập, bạn đã đồng ý với điều khoản dịch vụ và chính sách bảo mật của chúng tôi.
              </Typography>
            </Box>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SignupPopup;

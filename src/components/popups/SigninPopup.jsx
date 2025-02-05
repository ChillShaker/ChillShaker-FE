import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GoogleIcon from '@mui/icons-material/Google';
import { styled } from '@mui/material/styles';
import { login } from 'src/libs/services/AuthenService';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import useAuthStore from 'src/libs/hooks/useUserStore';
import { jwtDecode } from "jwt-decode";

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

const SigninPopup = ({ open, onClose, onSwitchToSignup, onSwitchToForgotPassword }) => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setLoading(true);

    try {
      const response = await login(formData);
      
      if (response?.code === 200 && response.data) {
        const { accessToken, refreshToken } = response.data;
        
        // Decode JWT để lấy scope
        const decodedToken = jwtDecode(accessToken);
        const userScope = decodedToken.scope; // Lấy scope từ JWT

        loginUser(accessToken, {
          refreshToken,
          email: formData.email,
          role: userScope // Lưu scope như role
        });
        
        toast.success('Đăng nhập thành công!');
        onClose();

        // Điều hướng dựa trên scope
        switch(userScope) {
          case 'STAFF':
            navigate('/staff/booking-management');
            break;
          case 'CUSTOMER':
            navigate('/');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'MANAGER':
            navigate('/manager/managerDrinkCategory');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra khi đăng nhập!');
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
              Đăng nhập
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
                label="Mật khẩu"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                placeholder="••••••••"
              />

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: -0.5
              }}>
                <Typography
                  onClick={onSwitchToForgotPassword}
                  sx={{
                    color: '#9b51e0',
                    cursor: 'pointer',
                    fontSize: '13px',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Quên mật khẩu?
                </Typography>
                <Typography
                  onClick={onSwitchToSignup}
                  sx={{
                    color: '#9b51e0',
                    cursor: 'pointer',
                    fontSize: '13px',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Đăng ký
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="gradient-button"
                sx={{
                  mt: { xs: 0.5, sm: 1 },
                  py: { xs: 0.8, sm: 1.2 },
                  borderRadius: '25px',
                  textTransform: 'none',
                  fontSize: { xs: '14px', sm: '16px' },
                }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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

export default SigninPopup;

import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import useAuthStore from 'src/libs/hooks/useUserStore';
import { toast } from 'react-toastify';
import logo from "../../assets/logo.png";

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(155, 81, 224, 0.2)',
    borderRadius: '12px',
    minWidth: '200px',
    '& .MuiList-root': {
      padding: '8px',
    },
  },
}));

const StyledMenuItem = styled(MenuItem)({
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    backgroundColor: 'rgba(155, 81, 224, 0.1)',
  },

  '& .MuiSvgIcon-root': {
    fontSize: '20px',
    color: '#9b51e0',
  },

  '& .MuiTypography-root': {
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
  }
});

const StaffHeader = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đăng xuất thành công');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  return (
    <AppBar 
      position="fixed"
      sx={{
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(155, 81, 224, 0.2)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: '64px',
        '& .MuiToolbar-root': {
          height: '100%',
          minHeight: '64px !important'
        }
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={logo}
            alt="Logo"
            style={{ height: '40px', marginRight: '16px' }}
          />
          <Typography variant="h6" sx={{ color: '#9b51e0', fontWeight: 600 }}>
            Staff Portal
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleMenu}
            sx={{ color: 'white' }}
          >
            <AccountCircle />
          </IconButton>

          <StyledMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <StyledMenuItem onClick={handleLogout}>
              <LogoutIcon />
              <Typography>Đăng xuất</Typography>
            </StyledMenuItem>
          </StyledMenu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default StaffHeader; 
import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import BookOnlineIcon from '@mui/icons-material/BookOnline';

// Styled components
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(155, 81, 224, 0.2)',
    padding: '20px 0',
    marginTop: '64px', // Height of header
    height: `calc(100% - 64px)`, // Full height minus header
    [theme.breakpoints.down('sm')]: {
      marginTop: 0,
      height: '100%',
    },
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ active }) => ({
  margin: '8px 16px',
  borderRadius: '12px',
  backgroundColor: active ? 'rgba(155, 81, 224, 0.1)' : 'transparent',
  border: active ? '1px solid rgba(155, 81, 224, 0.2)' : '1px solid transparent',
  
  '&:hover': {
    backgroundColor: 'rgba(155, 81, 224, 0.15)',
    border: '1px solid rgba(155, 81, 224, 0.3)',
  },

  '& .MuiListItemIcon-root': {
    color: active ? '#9b51e0' : 'rgba(255, 255, 255, 0.7)',
    minWidth: '40px',
  },

  '& .MuiListItemText-primary': {
    color: active ? '#fff' : 'rgba(255, 255, 255, 0.7)',
    fontWeight: active ? 600 : 400,
    fontSize: '0.95rem',
  },
}));

const menuItems = [
  {
    text: 'Quản lý Booking',
    icon: <BookOnlineIcon />,
    path: '/staff/booking-management'
  },
  {
    text: 'Sơ đồ bàn',
    icon: <TableRestaurantIcon />,
    path: '/staff/table-layout'
  }
];

const StaffSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledListItemButton
              active={location.pathname === item.path ? 1 : 0}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            left: 16,
            top: 12,
            zIndex: 1199,
            color: '#9b51e0',
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Mobile Drawer */}
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better mobile performance
        }}
      >
        {drawer}
      </StyledDrawer>
    </>
  );
};

export default StaffSidebar; 
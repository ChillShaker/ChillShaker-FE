import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  AppBar,
  Badge,
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import Cookies from "js-cookie";
import React, { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "src/libs/hooks/useUserStore";
import logo from "../../assets/logo.png";
import useScrollPosition from '../../hooks/useScrollPosition';
import SigninPopup from '../popups/SigninPopup';
import SignupPopup from '../popups/SignupPopup';
import VerifyOtpPopup from '../popups/VerifyOtpPopup';
import styled from "@emotion/styled";
import LogoutIcon from "@mui/icons-material/Logout";

const baseURL = import.meta.env.VITE_BASE_URL;

// Thêm styled component cho các nút navigation
const NavButton = styled(Button)(({ variant }) => ({
  color: 'white',
  borderRadius: '8px',
  padding: '8px 24px',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: '500',
  minWidth: '140px', // Đảm bảo chiều rộng tối thiểu đồng nhất
  height: '40px', // Chiều cao cố định
  transition: 'all 0.3s ease',

  ...(variant === 'home' && {
    background: 'rgba(155, 81, 224, 0.1)',
    border: '1px solid rgba(155, 81, 224, 0.2)',
    '&:hover': {
      background: 'rgba(155, 81, 224, 0.2)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(155, 81, 224, 0.15)',
    },
  }),

  ...(variant === 'signin' && {
    background: 'rgba(20, 20, 20, 0.6)',
    border: '1px solid rgba(155, 81, 224, 0.3)',
    '&:hover': {
      background: 'rgba(155, 81, 224, 0.1)',
      borderColor: '#9b51e0',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(155, 81, 224, 0.15)',
    },
  }),

  ...(variant === 'signup' && {
    background: 'linear-gradient(135deg, rgba(6, 147, 227, 1) 0%, rgb(155, 81, 224) 100%)',
    border: 'none',
    boxShadow: 'none',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(6, 147, 227, 0.9) 0%, rgba(155, 81, 224, 0.9) 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(155, 81, 224, 0.3)',
    },
  }),
}));

// Thêm styled component cho MenuItem
const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    background: 'rgba(155, 81, 224, 0.1)',
  },

  '& .MuiSvgIcon-root': {
    fontSize: '20px',
    color: '#9b51e0',
  },

  '& .MuiTypography-root': {
    fontSize: '14px',
    fontWeight: '500',
  }
}));

// Điều chỉnh lại styled component cho Menu
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: '8px',
    background: 'rgba(20, 20, 20, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(155, 81, 224, 0.2)',
    borderRadius: '12px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
    minWidth: '200px',
    '& .MuiList-root': {
      padding: '8px',
    },
  },
}));

const CustomerHeader = () => {
  const { scrollPosition, scrollDirection } = useScrollPosition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const { isLoggedIn, userInfo, logout } = useAuthStore();
  const navigate = useNavigate();

  const [accountId, setAccountId] = useState(null);

  const [openForgetPassword, setOpenForgetPassword] = useState(false);

  const [openSignin, setOpenSignin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [openVerifyOtp, setOpenVerifyOtp] = useState(false);

  useEffect(() => {
    const storedUserInfo = Cookies.get("userInfo");
    if (storedUserInfo) {
      const userInfoParsed = JSON.parse(storedUserInfo);
      setAccountId(userInfoParsed.accountId);
    }
  }, []);

  // Thêm useEffect để fetch notifications khi component mount và khi fcmToken thay đổi
  useEffect(() => {
    if (isLoggedIn && accountId) {
      // Khởi tạo SignalR connection
      const connection = createNotificationConnection(accountId);
      
      // Lắng nghe sự kiện nhận notification mới
      const handleNewNotification = (event) => {
        const newNotification = event.detail;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      };

      // Đăng ký lắng nghe sự kiện
      document.addEventListener('notificationReceived', handleNewNotification);

      // Kết nối SignalR
      startNotificationConnection(connection);

      // Initial fetch
      fetchNotifications();

      return () => {
        // Cleanup
        document.removeEventListener('notificationReceived', handleNewNotification);
        connection?.stop();
      };
    }
  }, [isLoggedIn, accountId]);

  const handleMenuClick = (event) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      handleMenuClose();

      // Hiển thị loading overlay trong 1 giây
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Xóa dữ liệu và chuyển hướng
      sessionStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất");
      setIsLoggingOut(false);
    }
  };

  const handleOpenLogin = () => {
    setOpenLogin(true);
    setOpenRegister(false); // Đảm bảo chỉ mở một popup
  };

  const handleCloseLogin = () => setOpenLogin(false);

  const handleOpenRegister = () => {
    setOpenRegister(true);
    setOpenLogin(false); // Đảm bảo chỉ mở một popup
  };

  const handleCloseRegister = () => setOpenRegister(false);

  const handleLoginSuccess = (userData) => {
    setOpenLogin(false);
    setAnchorEl(null);
  };

  // Thêm component LoadingOverlay
  const LoadingOverlay = () => (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <CircularProgress size={60} sx={{ color: "#FFA500" }} />
      <Typography sx={{ color: "white", fontSize: "1.2rem" }}>
        Đang đăng xuất...
      </Typography>
    </div>
  );

  const handleOpenForgetPassword = () => {
    setOpenLogin(false);
    setOpenForgetPassword(true);
  };

  const handleCloseForgetPassword = () => {
    setOpenForgetPassword(false);
  };

  const handleSwitchToLogin = () => {
    setOpenForgetPassword(false);
    setOpenLogin(true);
  };

  const handleOpenSignin = () => {
    setOpenSignin(true);
  };

  const handleCloseSignin = () => {
    setOpenSignin(false);
  };

  const handleOpenSignup = () => {
    setOpenSignup(true);
    setOpenSignin(false);
  };

  const handleCloseSignup = () => {
    setOpenSignup(false);
  };

  const handleSwitchToSignup = () => {
    setOpenSignin(false);
    setOpenSignup(true);
  };

  const handleSwitchToSignin = () => {
    setOpenSignup(false);
    setOpenVerifyOtp(false);
    setRegisteredEmail('');
    
    setTimeout(() => {
      setOpenSignin(true);
    }, 300);
  };

  const handleOpenForgotPassword = () => {
    setOpenSignin(false);
    setOpenForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setOpenForgotPassword(false);
  };

  const handleOpenVerifyOtp = (email) => {
    setOpenSignup(false);
    
    // Đợi animation đóng hoàn thành
    setTimeout(() => {
      setRegisteredEmail(email);
      setOpenVerifyOtp(true);
    }, 300);
  };

  const handleCloseVerifyOtp = () => {
    setOpenVerifyOtp(false);
    setRegisteredEmail('');
  };

  // Add monitoring effects
  useEffect(() => {
  }, [openSignup]);

  useEffect(() => {
  }, [openVerifyOtp]);

  useEffect(() => {
  }, [registeredEmail]);

  // Thêm xử lý cho việc chuyển đến trang Profile
  const handleProfileClick = () => {
    navigate('/my-profile');
    handleMenuClose();
  };

  return (
    <Fragment>
      {isLoggingOut && <LoadingOverlay />}

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: scrollPosition > 50 
            ? "rgba(20, 20, 20, 0.95)" 
            : "rgba(20, 20, 20, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: scrollPosition > 50 
            ? "1px solid rgba(155, 81, 224, 0.2)"
            : "1px solid rgba(155, 81, 224, 0.1)",
          padding: { 
            xs: scrollPosition > 50 ? 0.5 : 1, 
            sm: scrollPosition > 50 ? 0.5 : 2 
          },
          transform: scrollDirection === 'down' && scrollPosition > 500 
            ? 'translateY(-100%)' 
            : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1100,
          boxShadow: scrollPosition > 50 
            ? '0 4px 30px rgba(0, 0, 0, 0.3)'
            : 'none',
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: "space-between",
            minHeight: scrollPosition > 50 ? '64px' : '80px',
            transition: 'min-height 0.3s ease',
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
            padding: {
              xs: '0 16px',
              sm: '0 24px',
            },
          }}
        >
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center",
              transform: scrollPosition > 50 ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.3s ease',
            }}
          >
            <Link 
              to="/" 
              style={{ 
                textDecoration: "none",
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img 
                src={logo} 
                alt="ChillShaker Logo" 
                style={{ 
                  height: scrollPosition > 50 ? '50px' : '55px',
                  width: 'auto',
                  marginRight: '8px',
                  transition: 'all 0.3s ease',
                  filter: scrollPosition > 50 ? 'brightness(1.2)' : 'brightness(1)',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Link>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 3,
              opacity: scrollDirection === 'down' && scrollPosition > 500 ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            <NavButton
              component={Link}
              to="/"
              variant="home"
            >
              Trang chủ
            </NavButton>

            {!isLoggedIn ? (
              <Box 
                sx={{ 
                  display: "flex", 
                  gap: 2,
                  background: "rgba(20, 20, 20, 0.6)",
                  padding: "4px",
                  borderRadius: "12px",
                  border: "1px solid rgba(155, 81, 224, 0.2)",
                }}
              >
                <NavButton
                  onClick={handleOpenSignin}
                  variant="signin"
                >
                  Đăng nhập
                </NavButton>
                
                <NavButton
                  onClick={handleOpenSignup}
                  variant="signup"
                >
                  Đăng ký
                </NavButton>
              </Box>
            ) : (
              <Box 
                display="flex" 
                alignItems="center" 
                gap={2}
                sx={{
                  background: "rgba(20, 20, 20, 0.6)",
                  padding: "4px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(155, 81, 224, 0.2)",
                }}
              >
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { 
                      background: "rgba(155, 81, 224, 0.1)",
                    },
                  }}
                >
                  <Badge
                    sx={{
                      "& .MuiBadge-badge": {
                        background: "linear-gradient(135deg, rgba(6, 147, 227, 1) 0%, rgb(155, 81, 224) 100%)",
                        color: "white",
                      },
                    }}
                  >
                    <NotificationsIcon 
                      sx={{
                        color: "#fff",
                        transition: "color 0.3s ease",
                      }}
                    />
                  </Badge>
                </IconButton>

                <Box
                  onClick={handleMenuClick}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(155, 81, 224, 0.1)",
                    },
                  }}
                >
                  {userInfo?.image ? (
                    <img
                      src={userInfo.image}
                      alt="Profile"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "2px solid #9b51e0",
                      }}
                    />
                  ) : (
                    <AccountCircle sx={{ fontSize: 32, color: "#9b51e0" }} />
                  )}
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {userInfo?.fullname}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ 
              display: { md: "none" },
              color: "#9b51e0",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Add SigninPopup */}
      <SigninPopup
        open={openSignin}
        onClose={() => setOpenSignin(false)}
        onSwitchToSignup={handleSwitchToSignup}
        onSwitchToForgotPassword={handleOpenForgotPassword}
      />

      {/* Add SignupPopup */}
      <SignupPopup
        open={openSignup}
        onClose={() => {
          setOpenSignup(false);
        }}
        onSwitchToLogin={handleSwitchToSignin}
        onOpenVerifyOtp={(email) => {
          handleOpenVerifyOtp(email);
        }}
      />

      {/* Add VerifyOtpPopup */}
      <VerifyOtpPopup
        open={openVerifyOtp}
        onClose={handleCloseVerifyOtp}
        onSwitchToSignin={handleSwitchToSignin}
        email={registeredEmail}
      />

      {/* Thêm Menu Popup */}
      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          zIndex: 1200,
          '& .MuiBackdrop-root': {
            backgroundColor: 'transparent'
          }
        }}
      >
        <StyledMenuItem onClick={handleProfileClick}>
          <AccountCircle />
          <Typography sx={{ color: 'white' }}>
            My Profile
          </Typography>
        </StyledMenuItem>
        
        <StyledMenuItem onClick={handleLogout}>
          <LogoutIcon />
          <Typography sx={{ color: 'white' }}>
            Log out
          </Typography>
        </StyledMenuItem>
      </StyledMenu>

      {/* Add a placeholder to prevent content jump */}
      <Box sx={{ 
        height: { 
          xs: '80px', // Chiều cao cho mobile
          sm: '100px'  // Chiều cao cho desktop
        } 
      }} />
    </Fragment>
  );
};

export default CustomerHeader;

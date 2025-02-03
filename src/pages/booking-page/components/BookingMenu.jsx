import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, CircularProgress, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMenus } from '../../../libs/services/MenuService';
import { getMyProfile } from '../../../libs/services/AccountService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Styled components
const MenuCard = styled(Box)({
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  height: '450px',
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
  border: '1px solid rgba(155, 81, 224, 0.2)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 8px 25px rgba(155, 81, 224, 0.3)',
    border: '1px solid rgba(155, 81, 224, 0.4)',
    '& .menu-title': {
      color: '#9b51e0',
    },
    '& .menu-image': {
      transform: 'scale(1.05)',
    }
  },
});

const MenuImage = styled('img')({
  width: '100%',
  height: '250px',
  objectFit: 'cover',
  transition: 'transform 0.5s ease',
});

const MenuOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '20px',
  background: 'linear-gradient(to top, rgba(20, 20, 20, 0.95), rgba(20, 20, 20, 0.8), transparent)',
  height: '250px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
});

const MenuTitle = styled(Typography)({
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: '12px',
  color: '#fff',
  transition: 'color 0.3s ease',
  textAlign: 'center',
  fontFamily: "'Playfair Display', serif",
});

const MenuPrice = styled(Typography)({
  color: '#9b51e0',
  fontWeight: 600,
  fontSize: '1.2rem',
  textAlign: 'center',
  marginTop: 'auto',
  padding: '8px 16px',
  borderRadius: '20px',
  background: 'rgba(155, 81, 224, 0.1)',
  border: '1px solid rgba(155, 81, 224, 0.2)',
  width: 'fit-content',
  margin: '12px auto 0',
});

const MenuDescription = styled(Typography)({
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.8)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  textAlign: 'center',
  lineHeight: '1.6',
});

const SelectedMenuPanel = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '15px',
  padding: '15px',
  height: 'calc(100vh - 350px)',
  position: 'sticky',
  top: '100px',
  overflowY: 'auto',
  marginTop: '52px',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(155, 81, 224, 0.1)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#9b51e0',
    borderRadius: '2px',
  },
}));

const BookingMenu = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [countdowns, setCountdowns] = useState({});
  const [countdownIntervals, setCountdownIntervals] = useState({});
  const intervalsRef = useRef({});
  const [userInfo, setUserInfo] = useState(null);

  // Validate và lưu thông tin đặt bàn
  useEffect(() => {
    const validateBookingData = () => {
      const bookingData = location.state;
      
      if (!bookingData) {
        toast.error('Không có thông tin đặt bàn');
        navigate('/booking/tables');
        return false;
      }

      const { selectedTables, selectedDate, selectedTime, bookingType } = bookingData;

      if (!selectedTables || selectedTables.length === 0) {
        toast.error('Vui lòng chọn bàn trước khi chọn menu');
        navigate('/booking/tables');
        return false;
      }

      // Lưu thông tin hợp lệ
      setBookingInfo({
        selectedTables,
        selectedDate,
        selectedTime,
        bookingType
      });

      return true;
    };

    validateBookingData();
  }, [location.state, navigate]);

  // Fetch menus data
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const response = await getMenus();
        console.log('Menu response:', response);
        
        // Sửa lại cách kiểm tra response để lấy đúng cấu trúc data
        if (response?.code === 200 && response?.data?.content) {
          setMenus(response.data.content); // Lấy mảng menu từ response.data.content
        } else {
          setMenus([]);
          toast.error('Không có dữ liệu menu');
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
        toast.error('Không thể tải danh sách menu');
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  // Thêm hàm format countdown
  const formatCountdown = (seconds) => {
    if (seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Thêm useEffect cho countdown
  useEffect(() => {
    if (location.state?.countdownInfo) {
      const { countdowns: savedCountdowns, startTime } = location.state.countdownInfo;
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      
      // Cập nhật thời gian còn lại
      const updatedCountdowns = Object.entries(savedCountdowns).reduce((acc, [tableId, time]) => {
        const remainingTime = Math.max(0, time - timeElapsed);
        acc[tableId] = remainingTime;
        return acc;
      }, {});

      setCountdowns(updatedCountdowns);

      // Xóa tất cả intervals cũ
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};

      // Khởi tạo intervals mới cho mỗi bàn
      Object.entries(updatedCountdowns).forEach(([tableId, time]) => {
        if (time > 0) {
          const interval = setInterval(() => {
            setCountdowns(prev => {
              const currentCount = prev[tableId];
              
              if (currentCount <= 1) {
                clearInterval(intervalsRef.current[tableId]);
                delete intervalsRef.current[tableId];
                handleTableTimeout(tableId);
                return {
                  ...prev,
                  [tableId]: 0
                };
              }

              return {
                ...prev,
                [tableId]: currentCount - 1
              };
            });
          }, 1000);

          intervalsRef.current[tableId] = interval;
        }
      });
    }

    // Cleanup function
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval);
      intervalsRef.current = {};
    };
  }, [location.state]); // Chỉ chạy khi location.state thay đổi

  // Thêm hàm xử lý timeout
  const handleTableTimeout = (tableId) => {
    toast.error(`Bàn ${bookingInfo?.selectedTables.find(t => t.id === tableId)?.name} đã hết thời gian giữ chỗ`);
    
    setBookingInfo(prev => ({
      ...prev,
      selectedTables: prev.selectedTables.filter(table => table.id !== tableId)
    }));

    // Nếu không còn bàn nào, quay về trang chọn bàn
    if (bookingInfo?.selectedTables.length <= 1) {
      toast.error('Không còn bàn nào được chọn. Vui lòng chọn bàn lại.');
      navigate('/booking/tables');
      return;
    }

    // Gửi thông báo cập nhật trạng thái bàn
    webSocketService.sendBarTableStatusUpdateRequest({
      barTableId: tableId,
      bookingDate: bookingInfo.selectedDate,
      bookingTime: bookingInfo.selectedTime,
      status: 'EMPTY'
    });
  };

  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
  };

  const handleBookingWithMenu = () => {
    if (!selectedMenu) {
      toast.error('Vui lòng chọn một menu');
      return;
    }

    navigate('/booking/payment', {
      state: {
        bookingData: {
          tables: bookingInfo.selectedTables.map(table => table.name),
          tableIds: bookingInfo.selectedTables.map(table => table.id),
          bookingDate: bookingInfo.selectedDate,
          bookingTime: bookingInfo.selectedTime,
          selectedMenu,
          totalPrice: selectedMenu.price,
          bookingType: 'BOOKING_WITH_MENU',
        }
      }
    });
  };

  // Thêm useEffect để lấy thông tin user khi component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getMyProfile();
        console.log('User info response:', response);
        if (response?.data?.code === 200) {
          setUserInfo(response.data.data);
        } else {
          console.error('Invalid response format:', response);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        toast.error('Không thể tải thông tin người dùng');
      }
    };

    fetchUserInfo();
  }, []);

  // Cập nhật phần hiển thị thông tin bàn
  const renderTableInfo = () => {
    if (!bookingInfo?.selectedTables) return null;

    return (
      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
        Bàn: {bookingInfo.selectedTables.map(table => table.name).join(', ')}
      </Typography>
    );
  };

  // Thêm keyframes cho animation
  const pulseKeyframes = `
    @keyframes pulse {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(1.02);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  // Thêm style global
  const GlobalStyles = styled('style')({
    '@global': {
      '@import': "url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap')",
      [pulseKeyframes]: '',
    },
  });

  return (
    <Box sx={{
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      pt: { xs: '80px', sm: '100px' },
      pb: { xs: 3, sm: 4 }
    }}>
      <Container maxWidth="xl">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/booking/tables')}
          sx={{ 
            color: '#9b51e0',
            mb: 3,
            fontSize: '0.9rem'
          }}
        >
          Quay lại chọn bàn
        </Button>

        {/* Booking Info Summary - Thêm thông tin user */}
        <Box sx={{
          backgroundColor: 'rgba(155, 81, 224, 0.1)',
          borderRadius: '12px',
          p: 3,
          mb: 4,
        }}>
          <Typography variant="h6" sx={{ 
            color: '#fff', 
            mb: 2,
            fontSize: '1.1rem',
            fontWeight: 500
          }}>
            Thông tin đặt bàn
          </Typography>

          <Grid container spacing={2}>
            {/* Thông tin người dùng */}
            <Grid item xs={12}>
              <Box sx={{ 
                backgroundColor: 'rgba(155, 81, 224, 0.05)', 
                p: 2,
                borderRadius: '8px',
                mb: 2
              }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem'
                    }}>
                      Họ tên: {userInfo?.fullName || 'Đang tải...'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem'
                    }}>
                      Email: {userInfo?.email || 'Đang tải...'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem'
                    }}>
                      SĐT: {userInfo?.phone || 'Chưa cập nhật'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Thông tin bàn và countdown */}
            {bookingInfo?.selectedTables.map(table => (
              <Grid item xs={12} md={4} key={table.id}>
                <Box sx={{
                  backgroundColor: 'rgba(155, 81, 224, 0.05)',
                  p: 2,
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Box>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem'
                    }}>
                      Bàn {table.name}
                    </Typography>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.8rem'
                    }}>
                      {bookingInfo.selectedDate} - {bookingInfo.selectedTime}
                    </Typography>
                  </Box>
                  <Typography sx={{ 
                    color: countdowns[table.id] <= 60 ? '#ff4444' : '#9b51e0',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    {formatCountdown(countdowns[table.id] || 0)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Menu List (9 columns) */}
          <Grid item xs={12} md={9}>
            <Typography variant="h5" sx={{ 
              color: '#fff',
              mb: 3,
              fontWeight: 500
            }}>
              Chọn Menu
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: '#9b51e0' }} />
              </Box>
            ) : menus && menus.length > 0 ? (
              <Grid container spacing={3}>
                {menus.map((menu) => (
                  <Grid item xs={12} md={4} key={menu.id}>
                    <MenuCard 
                      onClick={() => handleMenuSelect(menu)}
                      sx={{
                        border: selectedMenu?.id === menu.id ? '2px solid #9b51e0' : '1px solid rgba(155, 81, 224, 0.2)',
                        cursor: 'pointer',
                        position: 'relative',
                        '&::before': selectedMenu?.id === menu.id ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          border: '2px solid rgba(155, 81, 224, 0.5)',
                          borderRadius: '12px',
                          animation: 'pulse 2s infinite'
                        } : {}
                      }}
                    >
                      <MenuImage 
                        className="menu-image"
                        src={menu.images || '/default-menu-image.jpg'}
                        alt={menu.name}
                        onError={(e) => {
                          e.target.src = '/default-menu-image.jpg';
                        }}
                      />
                      <Box sx={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        backgroundColor: 'rgba(155, 81, 224, 0.9)',
                        color: '#fff',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(5px)',
                      }}>
                        {menu.price ? `${menu.price.toLocaleString()}đ` : 'Liên hệ'}
                      </Box>
                      <MenuOverlay>
                        <MenuTitle className="menu-title">
                          {menu.name}
                        </MenuTitle>
                        <MenuDescription>
                          {menu.description?.replace(/\\n/g, '\n')}
                        </MenuDescription>
                      </MenuOverlay>
                    </MenuCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                backgroundColor: 'rgba(155, 81, 224, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(155, 81, 224, 0.1)'
              }}>
                <Typography sx={{ 
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 500
                }}>
                  Không có menu nào khả dụng
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Selected Menu Panel (3 columns) */}
          <Grid item xs={12} md={3}>
            <SelectedMenuPanel>
              <Typography variant="h6" sx={{ 
                color: '#fff',
                mb: 2,
                fontSize: '1rem'
              }}>
                Menu đã chọn
              </Typography>

              {selectedMenu && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Box
                      component="img"
                      src={selectedMenu.images || '/default-menu-image.jpg'}
                      sx={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        mb: 2
                      }}
                    />
                    <Typography sx={{ 
                      color: '#fff',
                      fontWeight: 500,
                      mb: 1
                    }}>
                      {selectedMenu.name}
                    </Typography>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.85rem',
                      whiteSpace: 'pre-line'
                    }}>
                      {selectedMenu.description?.replace(/\\n/g, '\n')}
                    </Typography>
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleBookingWithMenu}
                    sx={{
                      backgroundColor: '#9b51e0',
                      '&:hover': {
                        backgroundColor: '#7b3dad',
                      }
                    }}
                  >
                    Xác nhận đặt bàn
                  </Button>
                </>
              )}
            </SelectedMenuPanel>
          </Grid>
        </Grid>
      </Container>
      <GlobalStyles />
    </Box>
  );
};

export default BookingMenu;

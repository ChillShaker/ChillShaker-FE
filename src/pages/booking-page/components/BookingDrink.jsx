import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Grid, CircularProgress, Checkbox, FormControlLabel, Button, TextField, FormControl, Select, MenuItem, Pagination, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMyProfile } from '../../../libs/services/AccountService';
import { getDrinks } from '../../../libs/services/DrinkService';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// Styled components
const DrinkCard = styled(Box)({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '15px',
  overflow: 'hidden',
  position: 'relative',
  height: '160px',
  display: 'flex',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 3px 15px rgba(155, 81, 224, 0.3)',
  },
  transition: 'all 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(155, 81, 224, 0.1))',
    borderRadius: '15px',
  },
});

const DrinkImage = styled('img')({
  width: '120px',
  height: '120px',
  objectFit: 'contain',
  marginLeft: '-20px',
  transform: 'rotate(-15deg)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'rotate(-5deg) scale(1.05)',
  },
});

const DrinkContent = styled(Box)({
  padding: '15px',
  color: '#1a1a1a',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  zIndex: 1,
});

const FilterSection = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '15px',
  padding: '20px',
  marginBottom: '30px',
}));

// Thêm styled component cho selected drinks panel
const SelectedDrinksPanel = styled(Box)(({ theme }) => ({
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

const SelectedDrinkItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  padding: '8px',
  marginBottom: '8px',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

// Thêm styled component cho quantity controls
const QuantityControls = styled(Box)({
  position: 'absolute',
  bottom: '10px',
  right: '10px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '20px',
  padding: '4px 8px',
  zIndex: 2,
  border: '1px solid rgba(155, 81, 224, 0.3)',
  boxShadow: '0 2px 8px rgba(155, 81, 224, 0.15)',
});

const BookingDrink = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [attribute, setAttribute] = useState('name');
  const [sort, setSort] = useState('');
  const pageSize = 8; // Tăng số lượng hiển thị
  const [countdowns, setCountdowns] = useState({});
  const [countdownIntervals, setCountdownIntervals] = useState({});
  const intervalsRef = useRef({});

  // Validate và lưu thông tin đặt bàn
  useEffect(() => {
    const validateBookingData = () => {
      if (!location.state) {
        toast.error('Không có thông tin đặt bàn');
        navigate('/booking');
        return false;
      }

      const { selectedTables, selectedDate, selectedTime, bookingType } = location.state;

      if (!selectedTables?.length) {
        toast.error('Vui lòng chọn bàn trước khi đặt đồ uống');
        navigate('/booking');
        return false;
      }

      if (!selectedDate || !selectedTime) {
        toast.error('Thông tin đặt bàn không đầy đủ');
        navigate('/booking');
        return false;
      }

      if (bookingType !== 'WITH_DRINKS') {
        toast.error('Loại đặt bàn không hợp lệ');
        navigate('/booking');
        return false;
      }

      // Lưu thông tin đặt bàn vào state
      setBookingInfo({
        selectedTables,
        selectedDate,
        selectedTime,
        bookingType
      });

      return true;
    };

    if (!validateBookingData()) return;

    // Fetch drinks data
    const fetchDrinks = async () => {
      try {
        setLoading(true);
        const response = await getDrinks(pageIndex, pageSize, searchQuery, attribute, sort);
        if (response?.code === 200) {
          setDrinks(response.data.content);
          setTotalItems(response.data.totalElements);
        }
      } catch (error) {
        console.error('Error fetching drinks:', error);
        toast.error('Không thể tải danh sách đồ uống');
      } finally {
        setLoading(false);
      }
    };

    fetchDrinks();
  }, [pageIndex, searchQuery, attribute, sort]);

  // Thêm useEffect để lấy thông tin user
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getMyProfile();
        if (response?.data?.code === 200) {
          setUserInfo(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        toast.error('Không thể tải thông tin người dùng');
      }
    };

    fetchUserInfo();
  }, []);

  // Cập nhật state selectedDrinks để lưu quantity cho tất cả drinks
  useEffect(() => {
    if (drinks.length > 0) {
      setSelectedDrinks(drinks.map(drink => ({
        id: drink.id,
        quantity: 0
      })));
    }
  }, [drinks]);

  // Cập nhật handleQuantityChange
  const handleQuantityChange = (drinkId, change) => {
    setSelectedDrinks(prev => 
      prev.map(item => {
        if (item.id === drinkId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // Hiển thị thông tin bàn đã chọn rõ ràng hơn
  const renderSelectedTables = () => {
    if (!bookingInfo?.selectedTables?.length) return 'Chưa chọn bàn';
    return bookingInfo.selectedTables.map(table => table.name || table.id).join(', ');
  };

  // Cập nhật hàm handleBookingWithDrinks
  const handleBookingWithDrinks = () => {
    const drinksToBook = selectedDrinks.filter(drink => drink.quantity > 0);
    
    if (drinksToBook.length === 0) {
        toast.warning('Vui lòng chọn ít nhất một đồ uống');
        return;
    }

    // Tính tổng tiền đồ uống
    const totalDrinkPrice = drinks
        .filter(drink => {
            const selectedDrink = selectedDrinks.find(item => item.id === drink.id);
            return selectedDrink && selectedDrink.quantity > 0;
        })
        .reduce((total, drink) => {
            const selectedDrink = selectedDrinks.find(item => item.id === drink.id);
            return total + (drink.price * selectedDrink.quantity);
        }, 0);

    // Sửa lại cách format dữ liệu drinks
    const formattedDrinks = drinks
        .filter(drink => {
            const selectedDrink = selectedDrinks.find(item => item.id === drink.id);
            return selectedDrink && selectedDrink.quantity > 0;
        })
        .map(drink => {
            const selectedDrink = selectedDrinks.find(item => item.id === drink.id);
            return {
                ...drink,
                quantity: selectedDrink.quantity // Đảm bảo quantity được gắn vào từng drink
            };
        });

    // Chuẩn bị dữ liệu cho trang thanh toán
    const paymentData = {
        tables: bookingInfo.selectedTables.map(table => table.name),
        tableIds: bookingInfo.selectedTables.map(table => table.id),
        bookingDate: bookingInfo.selectedDate,
        bookingTime: bookingInfo.selectedTime,
        totalDrinkPrice: totalDrinkPrice,
        totalPrice: totalDrinkPrice,
        drinks: formattedDrinks, // Sử dụng mảng drinks đã được format
        bookingType: 'BOOKING_WITH_DRINKS',
    };

    navigate('/booking/payment', {
        state: {
            bookingData: paymentData
        }
    });
  };

  // Thêm hàm xử lý tìm kiếm
  const handleSearch = (value) => {
    setSearchQuery(value);
    setPageIndex(1); // Reset về trang đầu khi tìm kiếm
  };

  // Thêm hàm tính tổng tiền
  const calculateTotal = () => {
    return drinks
      .filter(drink => {
        const selectedDrink = selectedDrinks.find(item => item.id === drink.id);
        return selectedDrink && selectedDrink.quantity > 0;
      })
      .reduce((total, drink) => {
        const selectedDrink = selectedDrinks.find(item => item.id === drink.id);
        return total + (drink.price * selectedDrink.quantity);
      }, 0);
  };

  // Cập nhật useEffect cho countdown
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

  const handleTableTimeout = (tableId) => {
    toast.error(`Bàn ${bookingInfo?.selectedTables.find(t => t.id === tableId)?.name} đã hết thời gian giữ chỗ`);
    
    setBookingInfo(prev => ({
      ...prev,
      selectedTables: prev.selectedTables.filter(table => table.id !== tableId)
    }));

    // Gửi thông báo cập nhật trạng thái bàn
    webSocketService.sendBarTableStatusUpdateRequest({
      barTableId: tableId,
      bookingDate: formatDateForApi(location.state.selectedDate),
      bookingTime: formatTimeForApi(location.state.selectedTime),
      status: 'EMPTY'
    });
  };

  const formatCountdown = (seconds) => {
    if (seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      pt: { xs: '80px', sm: '100px' },
      pb: { xs: 3, sm: 4 }
    }}>
      <Container maxWidth="xl">
        {/* Booking Info Summary - Điều chỉnh kích thước */}
        <Box sx={{
          backgroundColor: 'rgba(155, 81, 224, 0.1)',
          borderRadius: '12px',
          p: 1.5, // Giảm padding
          mb: 2, // Giảm margin bottom
        }}>
          <Typography variant="h6" sx={{ 
            color: '#fff', 
            mb: 1,
            fontSize: '0.9rem', // Giảm font size
            fontWeight: 500
          }}>
            Thông tin đặt bàn
          </Typography>

          <Grid container spacing={1.5}> {/* Giảm spacing */}
            {/* Thông tin người đặt - Thu gọn */}
            <Grid item xs={12}>
              <Box sx={{ 
                backgroundColor: 'rgba(155, 81, 224, 0.05)', 
                p: 1.5, // Giảm padding
                borderRadius: '8px',
                mb: 1 // Giảm margin bottom
              }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.85rem' // Giảm font size
                    }}>
                      Họ tên: {userInfo?.fullName || 'Đang tải...'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.85rem'
                    }}>
                      Email: {userInfo?.email || 'Đang tải...'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.85rem'
                    }}>
                      SĐT: {userInfo?.phone || 'Chưa cập nhật'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Thông tin bàn và countdown - Thu gọn */}
            {bookingInfo?.selectedTables.map(table => (
              <Grid item xs={12} md={3} key={table.id}> {/* Giảm độ rộng từ 4 xuống 3 */}
                <Box sx={{
                  backgroundColor: 'rgba(155, 81, 224, 0.05)',
                  p: 1.5,
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: '40px' // Cố định chiều cao
                }}>
                  <Typography sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.85rem'
                  }}>
                    Bàn {table.name}
                  </Typography>
                  <Typography sx={{ 
                    color: countdowns[table.id] <= 60 ? '#ff4444' : '#9b51e0',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}>
                    {formatCountdown(countdowns[table.id] || 0)}
                  </Typography>
                </Box>
              </Grid>
            ))}

            {/* Thêm thông tin ngày giờ */}
            <Grid item xs={12} md={3}>
              <Box sx={{
                backgroundColor: 'rgba(155, 81, 224, 0.05)',
                p: 1.5,
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '40px'
              }}>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem'
                }}>
                  {bookingInfo?.selectedDate} - {bookingInfo?.selectedTime}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Main title */}
        <Typography
          variant="h5"
          sx={{
            color: '#9b51e0',
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: '1.5rem', sm: '1.8rem' }
          }}
        >
          Chọn đồ uống (tùy chọn)
        </Typography>

        <Grid container spacing={2}>
          {/* Danh sách đồ uống (7) */}
          <Grid item xs={12} md={8}>
            {/* Filter Section */}
            <FilterSection sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ 
                color: '#fff', 
                mb: 1.5,
                fontSize: '1rem'
              }}>
                Bộ lọc
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Tìm kiếm đồ uống..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#9b51e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#9b51e0',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#9b51e0',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <Select
                      value={attribute}
                      onChange={(e) => setAttribute(e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9b51e0',
                        },
                      }}
                    >
                      <MenuItem value="name">Tên đồ uống</MenuItem>
                      <MenuItem value="description">Mô tả</MenuItem>
                      <MenuItem value="price">Giá</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <Select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9b51e0',
                        },
                      }}
                    >
                      <MenuItem value="">Mặc định</MenuItem>
                      <MenuItem value="asc">Giá tăng dần</MenuItem>
                      <MenuItem value="desc">Giá giảm dần</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </FilterSection>

            {/* Drinks Grid */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: '#9b51e0' }} />
              </Box>
            ) : (
              <>
                <Typography sx={{ color: '#666', mb: 2, textAlign: 'right' }}>
                  Hiển thị {drinks.length} / {totalItems} kết quả
                </Typography>
                <Grid container spacing={2}>
                  {drinks.map((drink) => (
                    <Grid item xs={12} sm={6} key={drink.id}>
                      <DrinkCard>
                        <DrinkImage
                          src={drink.image || '/default-drink-image.jpg'}
                          alt={drink.name}
                          onError={(e) => {
                            e.target.src = '/default-drink-image.jpg';
                          }}
                        />
                        <DrinkContent>
                          <Typography sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            fontSize: '1rem',
                            color: '#1a1a1a'
                          }}>
                            {drink.name}
                          </Typography>
                          <Typography sx={{
                            color: '#666',
                            fontSize: '0.8rem',
                            mb: 1,
                            flex: 1
                          }}>
                            {drink.description}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 'auto',
                            pr: '100px'
                          }}>
                            <Typography sx={{
                              color: '#9b51e0',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                            }}>
                              {drink.price?.toLocaleString()}đ
                            </Typography>
                          </Box>
                          <QuantityControls>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(drink.id, -1)}
                              sx={{ 
                                color: '#9b51e0',
                                '&:hover': {
                                  backgroundColor: 'rgba(155, 81, 224, 0.1)',
                                },
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ 
                              mx: 2, 
                              color: '#9b51e0',
                              fontWeight: 600,
                              minWidth: '24px',
                              textAlign: 'center'
                            }}>
                              {selectedDrinks.find(item => item.id === drink.id)?.quantity || 0}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(drink.id, 1)}
                              sx={{ 
                                color: '#9b51e0',
                                '&:hover': {
                                  backgroundColor: 'rgba(155, 81, 224, 0.1)',
                                },
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </QuantityControls>
                        </DrinkContent>
                      </DrinkCard>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalItems > pageSize && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={Math.ceil(totalItems / pageSize)}
                      page={pageIndex}
                      onChange={(e, value) => setPageIndex(value)}
                      color="secondary"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: '#fff',
                        },
                        '& .Mui-selected': {
                          backgroundColor: '#9b51e0',
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>

          {/* Panel đồ uống đã chọn (3) */}
          <Grid item xs={12} md={4}>
            <SelectedDrinksPanel sx={{ mt: 0 }}>
              <Typography variant="h6" sx={{ 
                color: '#fff', 
                mb: 2,
                fontSize: '1rem'
              }}>
                Đồ uống đã chọn
              </Typography>

              {selectedDrinks.some(drink => drink.quantity > 0) ? (
                <>
                  {drinks
                    .filter(drink => {
                      const selectedDrink = selectedDrinks.find(item => item.id === drink.id);
                      return selectedDrink && selectedDrink.quantity > 0;
                    })
                    .map(drink => {
                      const selectedDrink = selectedDrinks.find(item => item.id === drink.id);
                      return (
                        <SelectedDrinkItem key={drink.id}>
                          <Box
                            component="img"
                            src={drink.image || '/default-drink-image.jpg'}
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: '8px',
                              mr: 2,
                              objectFit: 'cover'
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                              {drink.name}
                            </Typography>
                            <Typography sx={{ color: '#9b51e0' }}>
                              {drink.price?.toLocaleString()}đ x {selectedDrink.quantity}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => handleQuantityChange(drink.id, -selectedDrink.quantity)}
                            sx={{ color: '#9b51e0' }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </SelectedDrinkItem>
                      );
                    })}

                  <Box sx={{ mt: 3 }}>
                    <Typography sx={{ color: '#fff', mb: 2 }}>
                      Tổng cộng: {calculateTotal().toLocaleString()}đ
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleBookingWithDrinks}
                      sx={{
                        backgroundColor: '#9b51e0',
                        '&:hover': {
                          backgroundColor: '#7b3dad',
                        }
                      }}
                    >
                      Xác nhận đặt bàn
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                  Chưa có đồ uống nào được chọn
                </Typography>
              )}
            </SelectedDrinksPanel>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BookingDrink;

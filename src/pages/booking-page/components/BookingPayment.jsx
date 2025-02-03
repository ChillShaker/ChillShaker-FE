import React from 'react';
import { Box, Container, Typography, Grid, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-hot-toast';
import { bookingTableWithDrinks, bookingTableWithMenu } from 'src/libs/services/BookingService';

// Styled Components
const PaymentMethodButton = styled(Button)(({ selected }) => ({
  backgroundColor: selected ? 'rgba(155, 81, 224, 0.1)' : 'transparent',
  border: `1px solid ${selected ? '#9b51e0' : 'rgba(155, 81, 224, 0.3)'}`,
  borderRadius: '8px',
  padding: '10px',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  height: '45px',
  '&:hover': {
    backgroundColor: 'rgba(155, 81, 224, 0.1)',
  }
}));

const PaymentSummaryBox = styled(Box)({
  backgroundColor: 'rgba(155, 81, 224, 0.1)',
  borderRadius: '10px',
  padding: '15px',
});

// Thêm constants để quản lý booking types
const BOOKING_TYPES = {
  DRINKS: 'BOOKING_WITH_DRINKS',
  MENU: 'BOOKING_WITH_MENU'
};

const BookingPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPayment] = React.useState('VNPAY');

  const bookingInfo = location.state?.bookingData;
  
  if (!bookingInfo) {
    navigate('/booking');
    return null;
  }

  // Tách logic format data cho từng loại booking
  const formatBookingRequest = () => {
    const baseRequest = {
      barName: "Chill Shaker Bar",
      bookingDate: formatDateForApi(bookingInfo.bookingDate),
      bookingTime: formatTimeForApi(bookingInfo.bookingTime),
      numberOfPeople: parseInt(bookingInfo.numberOfPeople || 4),
      tableIds: bookingInfo.tableIds,
    };

    switch (bookingInfo.bookingType) {
      case BOOKING_TYPES.DRINKS:
        return {
          ...baseRequest,
          note: "Booking with drinks",
          totalPrice: parseFloat(bookingInfo.totalPrice),
          drinks: bookingInfo.drinks.map(drink => ({
            drinkId: drink.id,
            quantity: parseInt(drink.quantity)
          }))
        };

      case BOOKING_TYPES.MENU:
        return {
          ...baseRequest,
          note: "Booking with menu",
          totalPrice: parseFloat(bookingInfo.totalPrice),
          menuId: bookingInfo.selectedMenu.id
        };

      default:
        throw new Error('Invalid booking type');
    }
  };

  // Tách logic render drinks summary
  const renderDrinksSummary = () => (
    <>
      <Typography sx={{ 
        color: '#9b51e0',
        mb: 1,
        fontSize: '0.85rem',
        fontWeight: 500
      }}>
        Danh sách thức uống
      </Typography>
      
      <Box sx={{ 
        backgroundColor: 'rgba(155, 81, 224, 0.05)',
        p: 1.5,
        borderRadius: '8px',
        mb: 2
      }}>
        {bookingInfo.drinks.map((drink, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 0.5,
              '&:not(:last-child)': {
                borderBottom: '1px solid rgba(155, 81, 224, 0.1)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src={drink.image || '/default-drink-image.jpg'}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
              <Box>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem'
                }}>
                  {drink.name}
                </Typography>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.8rem'
                }}>
                  {drink.price?.toLocaleString()}đ x {drink.quantity}
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ 
              color: '#9b51e0',
              fontSize: '0.85rem',
              fontWeight: 500
            }}>
              {(drink.price * drink.quantity).toLocaleString()}đ
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );

  // Tách logic render menu summary
  const renderMenuSummary = () => (
    <>
      <Typography sx={{ 
        color: '#9b51e0',
        mb: 1,
        fontSize: '0.85rem',
        fontWeight: 500
      }}>
        Menu đã chọn
      </Typography>
      
      <Box sx={{ 
        backgroundColor: 'rgba(155, 81, 224, 0.05)',
        p: 1.5,
        borderRadius: '8px',
        mb: 2
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
        }}>
          <Box
            component="img"
            src={bookingInfo.selectedMenu.images || '/default-menu-image.jpg'}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ 
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 500,
              mb: 1
            }}>
              {bookingInfo.selectedMenu.name}
            </Typography>
            <Typography sx={{ 
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {bookingInfo.selectedMenu.description?.replace(/\\n/g, ' • ')}
            </Typography>
            <Typography sx={{ 
              color: '#9b51e0',
              fontSize: '0.9rem',
              fontWeight: 600
            }}>
              {bookingInfo.totalPrice.toLocaleString()}đ
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );

  // Sửa lại hàm render summary chính
  const renderBookingSummary = () => {
    switch (bookingInfo.bookingType) {
      case BOOKING_TYPES.DRINKS:
        return renderDrinksSummary();
      case BOOKING_TYPES.MENU:
        return renderMenuSummary();
      default:
        return null;
    }
  };

  // Sửa lại hàm handle payment
  const handlePayment = async () => {
    try {
      const bookingRequest = formatBookingRequest();
      const response = bookingInfo.bookingType === BOOKING_TYPES.DRINKS 
        ? await bookingTableWithDrinks(bookingRequest)
        : await bookingTableWithMenu(bookingRequest);

      if (response?.data?.code === 200) {
        const { paymentLink } = response.data.data;
        if (paymentLink) {
          window.location.href = paymentLink;
        } else {
          toast.error('Không nhận được link thanh toán');
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Có lỗi xảy ra khi đặt bàn');
    }
  };

  const formatDateForApi = (date) => {
    if (!date) return '';
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const formatTimeForApi = (time) => {
    if (!time) return '';
    return time.includes(':00') ? time : `${time}:00`;
  };

  // Thêm kiểm tra null/undefined cho các giá trị
  const totalDrinkPrice = bookingInfo.totalDrinkPrice || 0;
  const totalPrice = bookingInfo.totalPrice || 0;

  return (
    <Box sx={{
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      pt: { xs: '70px', sm: '90px' },
      pb: { xs: 2, sm: 3 }
    }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ 
            color: '#9b51e0',
            mb: 1.5,
            fontSize: '0.9rem'
          }}
        >
          Quay lại
        </Button>

        {/* Booking Summary */}
        <PaymentSummaryBox sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ 
            color: '#fff',
            mb: 1.5,
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            Thông tin đặt bàn
          </Typography>

          {/* Thông tin cơ bản */}
          <Box sx={{ 
            backgroundColor: 'rgba(155, 81, 224, 0.05)',
            p: 1.5,
            borderRadius: '8px',
            mb: 2
          }}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem'
                }}>
                  Bàn: {bookingInfo.tables.join(', ')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem'
                }}>
                  {bookingInfo.bookingDate} - {bookingInfo.bookingTime}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Render summary dựa theo bookingType */}
          {renderBookingSummary()}

          {/* Chi tiết thanh toán */}
          <Box sx={{ 
            backgroundColor: 'rgba(155, 81, 224, 0.05)',
            p: 1.5,
            borderRadius: '8px'
          }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem'
                }}>
                  Phí đặt chỗ
                </Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography sx={{ 
                  color: '#9b51e0',
                  fontSize: '0.85rem'
                }}>
                  Miễn phí
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  mt: 1,
                  pt: 1,
                  borderTop: '1px solid rgba(155, 81, 224, 0.2)'
                }}>
                  <Typography sx={{ 
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: '0.9rem'
                  }}>
                    Thành tiền
                  </Typography>
                  <Typography sx={{ 
                    color: '#9b51e0',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    {bookingInfo.totalPrice.toLocaleString()}đ
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </PaymentSummaryBox>

        {/* Payment Methods - Chỉ hiển thị VNPAY */}
        <Typography sx={{ 
          color: '#fff',
          mb: 1.5,
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          Phương thức thanh toán
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <PaymentMethodButton
              selected={true}
              sx={{
                justifyContent: 'center',
                gap: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)'
                }
              }}
            >
              <Box
                component="img"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp1v7T287-ikP1m7dEUbs2n1SbbLEqkMd1ZA&s"
                alt="VNPay"
                sx={{
                  height: '30px',
                  objectFit: 'contain'
                }}
              />
              <Typography sx={{ 
                color: '#fff',
                fontSize: '0.85rem'
              }}>
                VNPay
              </Typography>
            </PaymentMethodButton>
          </Grid>
        </Grid>

        {/* Confirm Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handlePayment}
          sx={{
            backgroundColor: '#9b51e0',
            py: 1.2,
            fontSize: '0.95rem',
            '&:hover': {
              backgroundColor: '#7b3dad',
            }
          }}
        >
          Thanh toán
        </Button>
      </Container>
    </Box>
  );
};

export default BookingPayment;

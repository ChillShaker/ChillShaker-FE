import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getMenus } from 'src/libs/services/MenuService';
import { getDrinks } from 'src/libs/services/DrinkService';
import { useNavigate } from 'react-router-dom';
import { getBarDetail } from 'src/libs/services/BarService';
import Cookies from 'js-cookie';
import SigninPopup from 'src/components/popups/SigninPopup';
import SignupPopup from 'src/components/popups/SignupPopup';
import VerifyOtpPopup from 'src/components/popups/VerifyOtpPopup';

const StyledImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '12px',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
});

const ImageWrapper = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '400px',
  overflow: 'hidden',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
    opacity: 1,
  },
});

const ImageSection = styled(Box)({
  position: 'relative',
  marginBottom: '80px',
});

const TableTypeTitle = styled(Typography)({
  color: '#fff',
  fontWeight: 600,
  marginTop: '16px',
  textAlign: 'center',
  fontSize: '1.1rem',
});

const TableTypeDescription = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.7)',
  textAlign: 'center',
  fontSize: '0.9rem',
  marginTop: '8px',
});

const MenuSection = styled(Box)({
  marginTop: '80px',
});

const MenuCard = styled(Box)({
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  transition: 'transform 0.3s ease',
  height: '450px',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
});

const MenuImage = styled('img')({
  width: '100%',
  height: '420px',
  objectFit: 'cover',
  borderRadius: '12px',
});

const MenuOverlay = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '20px',
  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 100%)',
  color: 'white',
  maxHeight: '100%',
  transition: 'max-height 0.3s ease',
  '&:hover': {
    maxHeight: '100%',
    background: 'rgba(0,0,0,0.95)'
  }
});

const DrinkCard = styled(Box)({
  backgroundColor: 'white',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  height: '200px',
  display: 'flex',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30%',
    height: '100%',
    background: 'linear-gradient(to left, #9b51e0, transparent)',
    borderTopRightRadius: '20px',
    borderBottomRightRadius: '20px',
  },
});

const DrinkImage = styled('img')({
  width: '150px',
  height: '150px',
  objectFit: 'contain',
  marginLeft: '-30px',
  transform: 'rotate(-15deg)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'rotate(-5deg) scale(1.1)',
  },
});

const DrinkContent = styled(Box)({
  padding: '20px',
  color: '#1a1a1a',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const DrinkCategory = styled(Typography)({
  color: '#666',
  fontSize: '0.9rem',
  marginBottom: '4px',
});

const DrinkIngredients = styled(Typography)({
  color: '#666',
  fontSize: '0.85rem',
  marginTop: '8px',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flex: 1,
});

const BookingButton = styled(Box)({
  position: 'fixed',
  right: 20,
  bottom: '50%',
  transform: 'translateY(50%)',
  zIndex: 100,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(50%) scale(1.05)',
  },
});

const BookingIcon = styled('div')({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(6, 147, 227, 1) 0%, rgb(155, 81, 224) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
  textAlign: 'center',
  lineHeight: 1.2,
  padding: '10px',
  boxShadow: '0 4px 15px rgba(155, 81, 224, 0.35)',
  '&:hover': {
    boxShadow: '0 6px 20px rgba(155, 81, 224, 0.45)',
  },
});

const ViewMoreButton = styled(Button)({
  background: 'linear-gradient(135deg, rgba(6, 147, 227, 0.1) 0%, rgba(155, 81, 224, 0.1) 100%)',
  border: '1px solid rgba(155, 81, 224, 0.3)',
  borderRadius: '8px',
  color: '#fff',
  padding: '10px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(6, 147, 227, 0.2) 0%, rgba(155, 81, 224, 0.2) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(155, 81, 224, 0.15)',
  },
});

const BarDetail = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drinks, setDrinks] = useState([]);
  const [drinksLoading, setDrinksLoading] = useState(true);
  const [barInfo, setBarInfo] = useState({
    name: '',
    description: '',
    images: []
  });
  const [barLoading, setBarLoading] = useState(true);
  const [openSignin, setOpenSignin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [openVerifyOtp, setOpenVerifyOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await getMenus();
        if (response?.code === 200 && response.data?.content) {
          setMenus(response.data.content);
        }
      } catch (error) {
        console.error('Error fetching menus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await getDrinks();
        if (response?.code === 200 && response.data?.content) {
          setDrinks(response.data.content);
        }
      } catch (error) {
        console.error('Error fetching drinks:', error);
      } finally {
        setDrinksLoading(false);
      }
    };

    fetchDrinks();
  }, []);

  useEffect(() => {
    const fetchBarDetail = async () => {
      try {
        const response = await getBarDetail();
        if (response?.code === 200 && response.data) {
          const { name, description, image } = response.data;
          const images = image.split(', ').filter(img => img.trim());
          setBarInfo({
            name,
            description,
            images
          });
        }
      } catch (error) {
        console.error('Error fetching bar detail:', error);
      } finally {
        setBarLoading(false);
      }
    };

    fetchBarDetail();
  }, []);

  const handleOpenSignin = () => {
    setOpenSignin(true);
    setOpenSignup(false);
  };

  const handleOpenSignup = () => {
    setOpenSignup(true);
    setOpenSignin(false);
  };

  const handleOpenVerifyOtp = (email) => {
    setRegisteredEmail(email);
    setOpenVerifyOtp(true);
    setOpenSignup(false);
  };

  const handleCloseVerifyOtp = () => {
    setOpenVerifyOtp(false);
  };

  const handleBookingClick = () => {
    const token = Cookies.get('token');
    if (!token) {
      handleOpenSignin();
    } else {
      navigate('/booking/tables');
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh', 
      pt: { xs: '100px', sm: '120px' },
      pb: { xs: 4, sm: 6 } 
    }}>
      <BookingButton onClick={handleBookingClick}>
        <BookingIcon>
          Đặt bàn ngay
        </BookingIcon>
      </BookingButton>

      <Container maxWidth="lg">
        <Box sx={{ 
          mb: 6, 
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <Typography
            variant="h4"
            sx={{
              color: '#9b51e0',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.5rem' }
            }}
          >
            {barInfo.name.toUpperCase()}
          </Typography>
          
          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            {barInfo.description}
          </Typography>
        </Box>

        <ImageSection>
          {barInfo.images.map((image, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' },
                alignItems: 'center',
                gap: 4,
                mb: 8,
                opacity: 0,
                animation: 'fadeIn 0.5s ease forwards',
                animationDelay: `${index * 0.2}s`,
                '@keyframes fadeIn': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(20px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  width: '100%',
                }}
              >
                <ImageWrapper>
                  <StyledImage
                    src={image}
                    alt={`Bar Area ${index + 1}`}
                    loading="lazy"
                  />
                </ImageWrapper>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  textAlign: { xs: 'center', md: 'left' },
                  px: { xs: 2, md: 4 },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: '#9b51e0',
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: '1.5rem', md: '1.8rem' },
                  }}
                >
                  {index === 0 && 'Âm nhạc cuốn hút'}
                  {index === 1 && 'Không gian sang trọng'}
                  {index === 2 && 'Khu vực Bar độc đáo'}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: 1.8,
                  }}
                >
                  {index === 0 && 'Vị ngon mê đắm của những đồ uống hảo hạng, kết hợp với âm nhạc sôi động tạo nên không gian giải trí tuyệt vời.'}
                  {index === 1 && 'Không gian sang trọng với nhiều vị trí đẹp, thiết kế hiện đại và view panorama tuyệt đẹp của thành phố về đêm.'}
                  {index === 2 && 'Quầy bar được thiết kế độc đáo với đội ngũ bartender chuyên nghiệp, mang đến những ly cocktail đẳng cấp.'}
                </Typography>
              </Box>
            </Box>
          ))}
        </ImageSection>

        <MenuSection>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                color: '#9b51e0',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.5rem' }
              }}
            >
              THỰC ĐƠN
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Khám phá các loại đồ uống độc đáo
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px' 
            }}>
              <CircularProgress sx={{ color: '#9b51e0' }} />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {menus.map((menu) => (
                <Grid item xs={12} md={4} key={menu.id}>
                  <MenuCard>
                    <MenuImage 
                      src={menu.images || '/default-menu-image.jpg'} 
                      alt={menu.name} 
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/default-menu-image.jpg';
                      }}
                    />
                    <MenuOverlay>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          color: '#9b51e0'
                        }}
                      >
                        {menu.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          mb: 1,
                          color: 'rgba(255, 255, 255, 0.8)',
                          whiteSpace: 'pre-line',
                          overflowY: 'auto',
                          maxHeight: '200px',
                          '&::-webkit-scrollbar': {
                            width: '4px'
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(255, 255, 255, 0.1)'
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: '#9b51e0',
                            borderRadius: '4px'
                          }
                        }}
                      >
                        {menu.description}
                      </Typography>
                    </MenuOverlay>
                  </MenuCard>
                </Grid>
              ))}
            </Grid>
          )}
        </MenuSection>

        <Box sx={{ mt: 10 }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{
                color: '#9b51e0',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.5rem' }
              }}
            >
              THỨC UỐNG
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Khám phá các loại thức uống độc đáo
            </Typography>
          </Box>

          {drinksLoading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px' 
            }}>
              <CircularProgress sx={{ color: '#9b51e0' }} />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {drinks.map((drink) => (
                <Grid item xs={12} md={6} key={drink.id}>
                  <DrinkCard>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      width: '100%',
                      height: '100%'
                    }}>
                      <DrinkImage 
                        src={drink.image || '/default-drink-image.jpg'} 
                        alt={drink.name}
                        onError={(e) => {
                          e.target.src = '/default-drink-image.jpg';
                        }}
                      />
                      <DrinkContent>
                        <DrinkCategory>
                          {drink.drinkCategory?.name || 'Uncategorized'}
                        </DrinkCategory>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            fontSize: '1.1rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {drink.name}
                        </Typography>
                        <DrinkIngredients>
                          {drink.description}
                        </DrinkIngredients>
                        <Typography 
                          sx={{ 
                            color: '#9b51e0', 
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginTop: 'auto'
                          }}
                        >
                          {drink.price?.toLocaleString()}đ
                        </Typography>
                      </DrinkContent>
                    </Box>
                  </DrinkCard>
                </Grid>
              ))}
            </Grid>
          )}

          {!drinksLoading && drinks.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mt: 6 
            }}>
              <ViewMoreButton
                onClick={() => navigate('/drinks')}
              >
                Xem thêm thức uống
              </ViewMoreButton>
            </Box>
          )}
        </Box>
      </Container>

      <SigninPopup
        open={openSignin}
        onClose={() => setOpenSignin(false)}
        onSwitchToSignup={handleOpenSignup}
      />

      <SignupPopup
        open={openSignup}
        onClose={() => setOpenSignup(false)}
        onSwitchToLogin={handleOpenSignin}
        onOpenVerifyOtp={handleOpenVerifyOtp}
      />

      <VerifyOtpPopup
        open={openVerifyOtp}
        onClose={handleCloseVerifyOtp}
        onSwitchToSignin={handleOpenSignin}
        email={registeredEmail}
      />
    </Box>
  );
};

export default BarDetail;

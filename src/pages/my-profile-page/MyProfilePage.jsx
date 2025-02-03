import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import styled from '@emotion/styled';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import StarIcon from '@mui/icons-material/Star';
import { getMyProfile, updateProfile } from 'src/libs/services/AccountService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Styled Components
const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: 'rgba(155, 81, 224, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(155, 81, 224, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9b51e0',
    },
    '&.Mui-disabled': {
      color: 'rgba(255, 255, 255, 0.6)',
      backgroundColor: 'rgba(20, 20, 20, 0.8)',
      '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.8)',
    '&.Mui-focused': {
      color: '#9b51e0',
    },
    '&.Mui-disabled': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
  },
  '& input': {
    color: 'rgba(255, 255, 255, 0.9)',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
      opacity: 1,
    },
    '&:disabled': {
      color: 'rgba(255, 255, 255, 0.6)',
      WebkitTextFillColor: 'rgba(255, 255, 255, 0.6)',
    },
  },
  '&:hover .MuiOutlinedInput-root:not(.Mui-disabled)': {
    backgroundColor: 'rgba(20, 20, 20, 0.7)',
  },
});

const SaveButton = styled(Button)({
  background: 'linear-gradient(135deg, rgba(6, 147, 227, 1) 0%, rgb(155, 81, 224) 100%)',
  border: 0,
  borderRadius: '8px',
  color: 'white',
  padding: '10px 24px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(6, 147, 227, 0.9) 0%, rgba(155, 81, 224, 0.9) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(155, 81, 224, 0.3)',
  },
});

const StyledTab = styled(Tab)({
  color: 'rgba(255, 255, 255, 0.7)',
  textTransform: 'none',
  minWidth: 0,
  '&.Mui-selected': {
    color: '#9b51e0',
  },
});

// Thêm styled component cho TableCell
const StyledTableCell = styled(TableCell)({
  color: 'white',
  borderBottom: '1px solid rgba(155, 81, 224, 0.2)',
  '&.MuiTableCell-head': {
    backgroundColor: 'rgba(155, 81, 224, 0.1)',
    fontWeight: 600,
  }
});

// Thêm styled component cho TableRow
const StyledTableRow = styled(TableRow)({
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(155, 81, 224, 0.1)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(155, 81, 224, 0.1)',
  },
});

// Thêm styled component cho Avatar container
const AvatarContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
});

const MyProfilePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [profileData, setProfileData] = useState({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    oldFileUrls: [],
    newFiles: [],
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await getMyProfile();
      const { data } = response.data;
      
      const profileInfo = {
        fullName: data.fullName || '',
        dateOfBirth: data.dob || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
      };
      
      setProfileData(profileInfo);
      setEditedData(profileInfo);
      setBookings(data.bookings || []);
      setLoading(false);
    } catch (error) {
      toast.error('Không thể tải thông tin người dùng');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Status chip color mapping
  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: '#ffa726',
      CONFIRMED: '#66bb6a',
      CANCELLED: '#ef5350',
      COMPLETED: '#42a5f5'
    };
    return statusColors[status] || '#9e9e9e';
  };

  const handleViewBookingDetail = (bookingId) => {
    // Thêm loading state khi chuyển trang
    setLoading(true);
    navigate(`/booking-info/${bookingId}`);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(profileData);
  };

  const handleInputChange = (field) => (event) => {
    setEditedData({
      ...editedData,
      [field]: event.target.value
    });
  };

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    // Validate fullName
    if (!editedData.fullName || editedData.fullName.length < 4) {
      newErrors.fullName = 'Họ tên phải có ít nhất 4 ký tự';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate phone (0|+84)[3|5|7|8|9]xxxxxxxx
    const phoneRegex = /^(0|\+84)([3|5|7|8|9])+([0-9]{8})\b$/;
    if (editedData.phone && !phoneRegex.test(editedData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Validate address
    if (!editedData.address?.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle avatar change
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditedData(prev => ({
        ...prev,
        newFiles: [file]
      }));
    }
  };

  // Update submit handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('fullName', editedData.fullName);
      formData.append('email', editedData.email);
      formData.append('phone', editedData.phone);
      formData.append('address', editedData.address);
      
      // Add oldFileUrls if exists
      if (editedData.oldFileUrls?.length > 0) {
        editedData.oldFileUrls.forEach(url => {
          formData.append('oldFileUrls', url);
        });
      }

      // Add new avatar if exists
      if (editedData.newFiles?.length > 0) {
        formData.append('newFiles', editedData.newFiles[0]);
      }

      await updateProfile(formData);
      
      // Cập nhật lại profileData với tất cả các trường
      setProfileData({
        ...profileData,
        fullName: editedData.fullName,
        phone: editedData.phone,
        address: editedData.address,
        // Không cập nhật email vì nó không thể thay đổi
      });
      
      setIsEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const renderBookingHistory = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        backgroundColor: 'transparent',
        transition: 'opacity 0.3s ease',
        opacity: loading ? 0.7 : 1,
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <StyledTableCell>Mã đặt bàn</StyledTableCell>
            <StyledTableCell>Ngày đặt</StyledTableCell>
            <StyledTableCell>Giờ đặt</StyledTableCell>
            <StyledTableCell>Số người</StyledTableCell>
            <StyledTableCell>Tổng tiền</StyledTableCell>
            <StyledTableCell>Trạng thái</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((booking) => (
            <StyledTableRow 
              key={booking.bookingCode}
              onClick={() => handleViewBookingDetail(booking.id)}
            >
              <StyledTableCell>{booking.bookingCode}</StyledTableCell>
              <StyledTableCell>
                {format(new Date(booking.bookingDate), 'dd/MM/yyyy')}
              </StyledTableCell>
              <StyledTableCell>
                {booking.bookingTime.substring(0, 5)}
              </StyledTableCell>
              <StyledTableCell>{booking.numberOfPeople}</StyledTableCell>
              <StyledTableCell>
                {booking.totalPrice.toLocaleString()}đ
              </StyledTableCell>
              <StyledTableCell>
                <Chip
                  label={booking.status}
                  sx={{
                    backgroundColor: getStatusColor(booking.status),
                    color: 'white',
                  }}
                />
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          backgroundColor: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(155, 81, 224, 0.2)',
          p: { xs: 2, sm: 4 },
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: '#9b51e0',
            fontWeight: 600,
            mb: 4,
          }}
        >
          Thông tin cá nhân
        </Typography>

        <Grid container spacing={4}>
          {/* Avatar Section */}
          <Grid item xs={12} md={3}>
            <AvatarContainer>
              <Box sx={{ 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <Avatar
                  sx={{
                    width: 150,
                    height: 150,
                    border: '3px solid #9b51e0',
                    boxShadow: '0 4px 12px rgba(155, 81, 224, 0.3)',
                  }}
                  src={
                    editedData.newFiles?.[0] 
                      ? URL.createObjectURL(editedData.newFiles[0]) 
                      : (profileData.avatar || '/path-to-avatar.jpg')
                  }
                />
                {isEditing && (
                  <IconButton
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 5,
                      right: 5,
                      backgroundColor: 'rgba(155, 81, 224, 0.9)',
                      width: '36px',
                      height: '36px',
                      '&:hover': {
                        backgroundColor: '#9b51e0',
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    <EditIcon sx={{ color: 'white', fontSize: 18 }} />
                  </IconButton>
                )}
              </Box>
              <Typography
                sx={{
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  textAlign: 'center',
                  mt: 1
                }}
              >
                {profileData.fullName || 'Chưa cập nhật'}
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                }}
              >
                {profileData.email}
              </Typography>
            </AvatarContainer>
          </Grid>

          {/* Form Section */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label="Địa chỉ"
                  value={isEditing ? editedData.address : profileData.address}
                  onChange={handleInputChange('address')}
                  disabled={!isEditing}
                  error={!!errors.address}
                  helperText={errors.address}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label="Họ và tên"
                  value={isEditing ? editedData.fullName : profileData.fullName}
                  onChange={handleInputChange('fullName')}
                  disabled={!isEditing}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label="Ngày sinh"
                  type="date"
                  value={isEditing ? editedData.dateOfBirth : profileData.dateOfBirth}
                  onChange={handleInputChange('dateOfBirth')}
                  disabled={!isEditing}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label="Số điện thoại"
                  value={isEditing ? editedData.phone : profileData.phone}
                  onChange={handleInputChange('phone')}
                  disabled={!isEditing}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label="Email"
                  value={isEditing ? editedData.email : profileData.email}
                  disabled={true}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  mt: 2,
                  gap: 2
                }}>
                  {!isEditing ? (
                    <SaveButton onClick={handleEditClick}>
                      Chỉnh sửa thông tin
                    </SaveButton>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        sx={{
                          borderColor: 'rgba(155, 81, 224, 0.5)',
                          color: 'white',
                          '&:hover': {
                            borderColor: '#9b51e0',
                            backgroundColor: 'rgba(155, 81, 224, 0.1)',
                          },
                        }}
                      >
                        Hủy
                      </Button>
                      <SaveButton 
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? (
                          <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                          'Xác nhận'
                        )}
                      </SaveButton>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Update History Section */}
      <Box
        sx={{
          backgroundColor: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(155, 81, 224, 0.2)',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'rgba(155, 81, 224, 0.2)',
            mb: 3,
          }}
        >
          <StyledTab
            icon={<HistoryIcon />}
            iconPosition="start"
            label="Lịch sử đặt bàn"
          />
          <StyledTab
            icon={<StarIcon />}
            iconPosition="start"
            label="Lịch sử đánh giá"
          />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ color: 'white' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#9b51e0' }} />
              </Box>
            ) : (
              renderBookingHistory()
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ color: 'white', textAlign: 'center', p: 3 }}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Chưa có đánh giá nào
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MyProfilePage;

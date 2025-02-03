import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NoteIcon from '@mui/icons-material/Note';
import { toast } from 'react-hot-toast';

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(155, 81, 224, 0.2)',
    borderRadius: '16px',
    padding: '16px',
    minWidth: '400px',
  }
}));

const StyledDialogTitle = styled(DialogTitle)({
  color: '#fff',
  textAlign: 'center',
  fontSize: '1.5rem',
  fontWeight: 600,
});

const StyledDivider = styled(Divider)({
  margin: '16px 0',
  backgroundColor: 'rgba(155, 81, 224, 0.2)',
});

const InfoBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: 'rgba(155, 81, 224, 0.1)',
  borderRadius: '8px',
  marginBottom: '16px',
});

const TableList = styled(List)({
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '8px',
  padding: '8px',
});

const StyledListItem = styled(ListItem)({
  borderRadius: '4px',
  marginBottom: '4px',
  backgroundColor: 'rgba(155, 81, 224, 0.1)',
  '&:hover': {
    backgroundColor: 'rgba(155, 81, 224, 0.2)',
  },
});

const ActionButton = styled(Button)(({ variant }) => ({
  padding: '8px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  textTransform: 'none',
  ...(variant === 'contained' && {
    background: 'linear-gradient(135deg, rgba(6, 147, 227, 1) 0%, rgb(155, 81, 224) 100%)',
    color: '#fff',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(6, 147, 227, 0.9) 0%, rgba(155, 81, 224, 0.9) 100%)',
    },
  }),
  ...(variant === 'outlined' && {
    border: '1px solid rgba(155, 81, 224, 0.5)',
    color: '#fff',
    '&:hover': {
      border: '1px solid rgba(155, 81, 224, 0.8)',
      backgroundColor: 'rgba(155, 81, 224, 0.1)',
    },
  }),
}));

// Thêm styled component cho TextField
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    backgroundColor: 'rgba(155, 81, 224, 0.1)',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: 'rgba(155, 81, 224, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(155, 81, 224, 0.4)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9b51e0',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#9b51e0',
    },
  },
  '& .MuiInputAdornment-root': {
    color: '#9b51e0',
  },
});

const ConfirmPopup = ({ 
  open, 
  onClose, 
  selectedTables, 
  selectedDate,
  selectedTime,
  onConfirm 
}) => {
  const [userEmail, setUserEmail] = useState('');
  const [note, setNote] = useState('');
  const [bookingData, setBookingData] = useState(null);

  // Tính tổng tiền đặt cọc từ các bàn đã chọn
  const calculateTotalDeposit = useMemo(() => {
    return selectedTables.reduce((total, table) => {
      return total + (table.tableType.depositAmount || 0);
    }, 0);
  }, [selectedTables]);

  // Format số tiền thành dạng có dấu phẩy ngăn cách
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  useEffect(() => {
    try {
      const cookies = document.cookie.split('; ');
      
      // Tìm cookie userInfo
      const userInfoCookie = cookies.find(cookie => cookie.trim().startsWith('userInfo='));
      
      if (userInfoCookie) {
        // Tách lấy giá trị và decode URL
        const userInfoValue = decodeURIComponent(userInfoCookie.split('=')[1]);
        
        // Parse JSON để lấy thông tin user
        const userInfo = JSON.parse(userInfoValue);
        
        if (userInfo.email) {
          setUserEmail(userInfo.email);
        } else {
          // Fallback: Nếu không có email trong userInfo, thử lấy từ token
          const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
          if (tokenCookie) {
            const token = tokenCookie.split('=')[1];
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setUserEmail(tokenPayload.sub);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
      console.log('Cookie content:', document.cookie);
    }
  }, []);

  // Thêm console.log để debug
  useEffect(() => {
    console.log('Current userEmail:', userEmail);
  }, [userEmail]);

  // Xử lý khi người dùng nhấn xác nhận
  const handleConfirm = () => {

    const bookingRequest = {
      barName: "Chill Shaker Bar", // Thay thế barId bằng barName
      bookingDate: selectedDate.format('YYYY-MM-DD'),
      bookingTime: selectedTime.format('HH:mm:ss'),
      note: note.trim(),
      totalPrice: calculateTotalDeposit,
      tableIds: selectedTables.map(table => table.id)
    };

    // Gọi callback onConfirm với dữ liệu đặt bàn
    onConfirm(bookingRequest);
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
    >
      <StyledDialogTitle id="confirm-dialog-title">
        Xác nhận đặt bàn
      </StyledDialogTitle>

      <DialogContent>
        <InfoBox>
          <EmailIcon sx={{ color: '#9b51e0' }} />
          <Typography sx={{ color: '#fff' }}>
            {userEmail}
          </Typography>
        </InfoBox>

        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          mb: 2 
        }}>
          <InfoBox sx={{ flex: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Ngày đặt
              </Typography>
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                {selectedDate?.format('DD/MM/YYYY')}
              </Typography>
            </Box>
          </InfoBox>

          <InfoBox sx={{ flex: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Giờ đặt
              </Typography>
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                {selectedTime?.format('HH:mm')}
              </Typography>
            </Box>
          </InfoBox>
        </Box>

        <StyledDivider />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              backgroundColor: 'rgba(155, 81, 224, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(155, 81, 224, 0.2)',
            }}
          >
            <AttachMoneyIcon sx={{ color: '#9b51e0' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Tổng tiền đặt cọc
              </Typography>
              <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                {formatCurrency(calculateTotalDeposit)} VNĐ
              </Typography>
            </Box>
          </Box>

          <StyledTextField
            label="Ghi chú"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={3}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <NoteIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
          />

          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, display: 'block' }}>
              Chi tiết đặt cọc:
            </Typography>
            {selectedTables.map((table) => (
              <Box 
                key={table.id}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.9rem',
                  mb: 0.5
                }}
              >
                <span>{table.name} ({table.tableType.name})</span>
                <span>{formatCurrency(table.tableType.depositAmount)} VNĐ</span>
              </Box>
            ))}
          </Box>
        </Box>

        <StyledDivider />

        <Typography sx={{ color: '#fff', mb: 2 }}>
          Bàn đã chọn:
        </Typography>

        <TableList>
          {selectedTables.map((table) => (
            <StyledListItem key={table.id}>
              <EventSeatIcon sx={{ color: '#9b51e0', mr: 2 }} />
              <ListItemText
                primary={table.name}
                secondary={`Loại bàn: ${table.tableType.name}`}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: '#fff',
                    fontWeight: 500,
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
            </StyledListItem>
          ))}
        </TableList>
      </DialogContent>

      <DialogActions sx={{ padding: '16px', gap: '12px' }}>
        <ActionButton variant="outlined" onClick={onClose}>
          Hủy
        </ActionButton>
        <ActionButton 
          variant="contained" 
          onClick={handleConfirm}
        >
          Xác nhận đặt bàn
        </ActionButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ConfirmPopup;

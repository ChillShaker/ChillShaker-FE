import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { getBarTableByDateAndTime } from '../../../libs/services/BarTableService';
import { toast } from 'react-toastify';
import webSocketService from '../../../libs/web-socket/web-socket';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import TableType from './TableType';
import ConfirmPopup from '../../../components/popups/BookingConfirmPopup';
import { bookingTableOnly } from '../../../libs/services/BookingService';
import { useNavigate } from 'react-router-dom';

const SeatButton = styled(Button)(({ status }) => ({
  minWidth: '60px',
  width: '60px',
  height: '45px',
  margin: '4px',
  padding: '4px',
  borderRadius: '8px',
  border: '1px solid rgba(155, 81, 224, 0.2)',
  color: status === 'EMPTY' ? '#4CAF50' :
    status === 'PENDING' ? '#FFA726' :
      status === 'SERVING' ? '#F44336' :
        status === 'RESERVED' ? '#757575' :
          '#FFC107',
  backgroundColor: status === 'EMPTY' ? 'rgba(76, 175, 80, 0.1)' :
    status === 'PENDING' ? 'rgba(255, 167, 38, 0.1)' :
      status === 'SERVING' ? 'rgba(244, 67, 54, 0.1)' :
        status === 'RESERVED' ? 'rgba(117, 117, 117, 0.1)' :
          'rgba(255, 193, 7, 0.1)',
  '&:hover': {
    backgroundColor: status === 'EMPTY' ? 'rgba(76, 175, 80, 0.2)' :
      status === 'PENDING' ? 'rgba(255, 167, 38, 0.2)' :
        status === 'SERVING' ? 'rgba(244, 67, 54, 0.2)' :
          status === 'RESERVED' ? 'rgba(117, 117, 117, 0.2)' :
            'rgba(255, 193, 7, 0.2)',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(155, 81, 224, 0.2)',
  },
  '&.Mui-disabled': {
    backgroundColor: status === 'PENDING' ? 'rgba(255, 167, 38, 0.1)' :
      status === 'SERVING' ? 'rgba(244, 67, 54, 0.1)' :
        status === 'RESERVED' ? 'rgba(117, 117, 117, 0.1)' :
          'rgba(117, 117, 117, 0.1)',
    color: status === 'PENDING' ? '#FFA726' :
      status === 'SERVING' ? '#F44336' :
        status === 'RESERVED' ? '#757575' :
          '#757575',
    opacity: 1,
    border: '1px solid rgba(155, 81, 224, 0.2)',
  },
  animation: status === 'PENDING' ? 'pulse 1.5s infinite' : 'none',
  fontSize: '12px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
}));

const SeatRow = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  margin: '8px 0',
});

const SeatSection = styled(Box)({
  margin: '30px 0',
  position: 'relative',
});

const DoorLabel = styled(Typography)({
  color: '#00BCD4',
  fontSize: '14px',
  textAlign: 'center',
  margin: '20px 0',
  padding: '10px 0',
  position: 'relative',
  '&::before, &::after': {
    content: '""',
    display: 'inline-block',
    width: '80px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #00BCD4, transparent)',
    margin: '0 15px',
    verticalAlign: 'middle',
  },
});

const BarArea = styled(Box)({
  width: '200px',
  height: '80px',
  margin: '20px auto',
  border: '2px solid rgba(155, 81, 224, 0.3)',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(155, 81, 224, 0.1)',
  position: 'relative',
});

const BarSection = styled(Box)({
  position: 'relative',
  margin: '40px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
});

const BarCounterRow = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
});

const LoungeGroup = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)', // 2x2 grid
  gap: '8px',
});

// Tạo biến cho các màu sắc chung
const commonStyles = {
  borderColor: '#9b51e0',
  hoverBorderColor: '#b679f2',
  focusBorderColor: '#8445c3',
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
};

// Tạo custom theme cho date/time picker
const pickerTheme = createTheme({
  components: {
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          backgroundImage: 'none',
          border: '1px solid rgba(155, 81, 224, 0.2)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          //minWidth: '320px !important',
          '& .MuiTimePickerToolbar-root': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
          '& .MuiPickersLayout-contentWrapper': {
            overflowX: 'visible',
          }
        }
      }
    },
    MuiTimePicker: {
      styleOverrides: {
        root: {
          '& .MuiPickersLayout-contentWrapper': {
            minWidth: '280px',
          }
        }
      }
    },
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          padding: '8px',
          '& .MuiListItem-root': {
            borderRadius: '8px',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(155, 81, 224, 0.1)',
            },
            '&.Mui-selected': {
              backgroundColor: 'rgba(155, 81, 224, 0.2)',
              color: '#9b51e0',
              fontWeight: 600,
            }
          }
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          height: '40px',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: 'rgba(155, 81, 224, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(155, 81, 224, 0.2)',
            color: '#9b51e0',
            '&:hover': {
              backgroundColor: 'rgba(155, 81, 224, 0.3)',
            }
          }
        }
      }
    },
    MuiPickersToolbar: {
      styleOverrides: {
        root: {
          color: '#fff',
          padding: '16px',
          justifyContent: 'center',
          '& .MuiTypography-root': {
            color: '#fff',
          },
          '& .Mui-selected': {
            color: '#9b51e0',
          }
        }
      }
    },
    MuiPickersLayout: {
      styleOverrides: {
        root: {
          color: '#fff',
          backgroundColor: 'transparent',
          width: '100%',
          '& .MuiPickersLayout-actionBar': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
          '& ::-webkit-scrollbar': {
            width: '8px',
          },
          '& ::-webkit-scrollbar-track': {
            background: 'rgba(155, 81, 224, 0.1)',
            borderRadius: '4px',
          },
          '& ::-webkit-scrollbar-thumb': {
            background: 'rgba(155, 81, 224, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(155, 81, 224, 0.5)',
            }
          }
        }
      }
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          '& .MuiPickersCalendarHeader-label': {
            color: '#fff',
          },
          '& .MuiPickersCalendarHeader-switchViewButton': {
            color: '#9b51e0',
          },
          '& .MuiPickersArrowSwitcher-button': {
            color: '#9b51e0',
          },
          '& .MuiDayCalendar-weekDayLabel': {
            color: '#9b51e0',
          },
          '& .MuiPickersDay-root': {
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(155, 81, 224, 0.2)',
            },
            '&.Mui-selected': {
              backgroundColor: '#9b51e0',
            },
            '&.MuiPickersDay-today': {
              borderColor: '#9b51e0',
            },
          }
        }
      }
    },
    MuiClock: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(155, 81, 224, 0.1)',
          margin: '16px',
          width: '224px !important',
          height: '224px !important',
        },
        clock: {
          backgroundColor: 'transparent',
          borderColor: 'rgba(155, 81, 224, 0.2)',
        },
        pin: {
          backgroundColor: '#9b51e0',
        },
        clockNumber: {
          color: '#fff',
          '&.Mui-selected': {
            backgroundColor: '#9b51e0',
          },
        },
        amButton: {
          backgroundColor: 'rgba(155, 81, 224, 0.1)',
          color: '#fff',
          '&.Mui-selected': {
            backgroundColor: '#9b51e0',
          },
        },
        pmButton: {
          backgroundColor: 'rgba(155, 81, 224, 0.1)',
          color: '#fff',
          '&.Mui-selected': {
            backgroundColor: '#9b51e0',
          },
        },
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#9b51e0',
          '&:hover': {
            backgroundColor: 'rgba(155, 81, 224, 0.1)',
          },
        }
      }
    }
  }
});

const ViewButton = styled(Button)({
  background: 'linear-gradient(135deg, rgba(6, 147, 227, 1) 0%, rgb(155, 81, 224) 100%)',
  padding: '10px 24px',
  height: '56px',
  borderRadius: '8px',
  color: '#fff',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(6, 147, 227, 0.9) 0%, rgba(155, 81, 224, 0.9) 100%)',
    boxShadow: '0 4px 15px rgba(155, 81, 224, 0.3)',
    transform: 'translateY(-2px)',
  },
  '&.Mui-disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
});

const getSeatLabel = (section, index) => {
  switch (section) {
    case 'barCounter':
      return `BC-${index + 1}`;
    case 'loungeBar':
      return `LB-${index + 1}`;
    case 'vipBooth':
      return `VIP-${index + 1}`;
    case 'partyBar':
      return `PB-${index + 1}`;
    default:
      return `${index + 1}`;
  }
};

// Thêm styles mới cho DatePicker và TimePicker
const commonInputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: '12px',
    color: '#fff',
    width: '180px',
    height: '48px',
    border: '2px solid rgba(155, 81, 224, 0.2)',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(8px)',

    '& fieldset': {
      border: 'none'
    },

    '&:hover': {
      border: '2px solid rgba(155, 81, 224, 0.4)',
      backgroundColor: 'rgba(155, 81, 224, 0.1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(155, 81, 224, 0.15)',
    },

    '&.Mui-focused': {
      border: '2px solid #9b51e0',
      boxShadow: '0 0 0 4px rgba(155, 81, 224, 0.1)',
    },

    // Style cho input text
    '& input': {
      color: '#fff',
      fontSize: '0.95rem',
      fontWeight: 500,
      paddingLeft: '16px',
      '&::placeholder': {
        color: 'rgba(255, 255, 255, 0.5)',
        opacity: 1,
      }
    },
  },

  // Style cho label
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
    fontWeight: 500,
    transform: 'translate(14px, 14px)',

    '&.Mui-focused': {
      color: '#9b51e0',
      transform: 'translate(14px, -9px) scale(0.75)',
    },

    '&.MuiFormLabel-filled': {
      transform: 'translate(14px, -9px) scale(0.75)',
    }
  },

  // Style cho icons
  '& .MuiSvgIcon-root': {
    color: '#9b51e0',
    transition: 'transform 0.2s ease',
    fontSize: '1.3rem',

    '&:hover': {
      transform: 'scale(1.1)',
    }
  },

  // Style cho button endAdornment
  '& .MuiIconButton-root': {
    padding: '8px',
    marginRight: '4px',

    '&:hover': {
      backgroundColor: 'rgba(155, 81, 224, 0.1)',
    }
  }
};

// Thêm styled component cho các nút booking
const BookingButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.95rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  flex: 1,
  minWidth: '200px',
  background: 'linear-gradient(135deg, rgba(6, 147, 227, 1) 0%, rgb(155, 81, 224) 100%)',
  color: '#fff',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(6, 147, 227, 0.9) 0%, rgba(155, 81, 224, 0.9) 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(155, 81, 224, 0.3)',
  }
}));

// Thêm styled component cho nút đặt bàn
const ScrollButton = styled(Button)(({ show }) => ({
  position: 'fixed',
  right: '32px',
  top: '100px',
  zIndex: 1000,
  minWidth: '140px',
  height: '45px',
  background: 'linear-gradient(135deg, rgba(6, 147, 227, 1) 0%, rgb(155, 81, 224) 100%)',
  color: '#fff',
  borderRadius: '8px',
  padding: '8px 24px',
  transition: 'all 0.3s ease',
  opacity: show ? 1 : 0,
  visibility: show ? 'visible' : 'hidden',
  transform: show ? 'translateY(0)' : 'translateY(-20px)',
  boxShadow: '0 4px 12px rgba(155, 81, 224, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(6, 147, 227, 0.9) 0%, rgba(155, 81, 224, 0.9) 100%)',
    transform: show ? 'translateY(-2px)' : 'translateY(-20px)',
    boxShadow: '0 6px 16px rgba(155, 81, 224, 0.4)',
  },
}));

// Cập nhật style cho CountdownBox
const CountdownBox = styled(Box)({
  textAlign: 'center',
  padding: '24px',
  marginBottom: '24px',
  backgroundColor: 'rgba(20, 20, 20, 0.6)',
  borderRadius: '12px',
  border: '1px solid rgba(155, 81, 224, 0.2)',
});

const CountdownList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  marginTop: '16px',
});

const CountdownItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '8px 16px',
  width: '200px',
  justifyContent: 'space-between',
});

const TableName = styled(Typography)({
  color: '#9b51e0',
  fontWeight: 600,
  fontSize: '0.9rem',
});

const CountdownValue = styled(Typography)({
  color: '#fff',
  fontWeight: 500,
  fontSize: '0.9rem',
});

const BookingTable = () => {
  // Khai báo hàm getDefaultTime trước khi sử dụng
  const getDefaultTime = () => {
    const currentHour = dayjs().hour();
    let nextHour = currentHour + 1;

    // Nếu giờ tiếp theo < 10 hoặc > 23, set về 10 giờ sáng hôm sau
    if (nextHour < 10 || nextHour > 23) {
      nextHour = 10;
    }

    return dayjs()
      .set('hour', nextHour)
      .set('minute', 0)
      .set('second', 0);
  };

  // Sau đó mới sử dụng trong useState
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(getDefaultTime());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const datePickerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const [tableIntervals, setTableIntervals] = useState({});
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false);
  const [selectedTables, setSelectedTables] = useState([]);
  const [countdownIntervals, setCountdownIntervals] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [myPendingTables, setMyPendingTables] = useState({});
  const [tableOwners, setTableOwners] = useState({});
  const navigate = useNavigate();

  // Thêm useEffect để lấy email từ cookie khi component mount
  useEffect(() => {
    try {
      const cookies = document.cookie.split('; ');
      const userInfoCookie = cookies.find(cookie => cookie.trim().startsWith('userInfo='));

      if (userInfoCookie) {
        const userInfoValue = decodeURIComponent(userInfoCookie.split('=')[1]);
        const userInfo = JSON.parse(userInfoValue);
        if (userInfo.email) {
          setUserEmail(userInfo.email);
        }
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
  }, []);

  // Thêm hàm formatDateForDisplay
  const formatDateForDisplay = (date) => {
    return dayjs(date).format('DD/MM/YYYY');
  };

  // Format date và time theo yêu cầu của API
  const formatDateForApi = (date) => {
    return date.format('YYYY-MM-DD');
  };

  // Cập nhật hàm format time slot
  const formatTimeSlot = (time) => {
    const hour = time.hour();
    // Set phút và giây về 0
    return dayjs()
      .set('hour', hour)
      .set('minute', 0)
      .set('second', 0);
  };

  // Hàm format time cho API
  const formatTimeForApi = (time) => {
    return formatTimeSlot(time).format('HH:mm:ss');
  };

  // Xử lý WebSocket connection
  const connectWebSocket = (callback) => {
    if (!isConnected) {
      webSocketService.connect(
        () => {
          console.log('Connected to WebSocket');
          setIsConnected(true);
          if (callback) callback();
        },
        (error) => {
          console.error('WebSocket connection failed:', error);
          setIsConnected(false);
          toast.error('Không thể kết nối đến server real-time');
        }
      );
    } else {
      if (callback) callback();
    }
  };

  // Xử lý WebSocket subscription
  const subscribeToUpdates = () => {
    const handleWebSocketMessage = (wsResponse) => {
      console.log('WebSocket Message Received:', wsResponse);
      
      try {
        if (!wsResponse || typeof wsResponse !== 'object') {
          console.error('Invalid WebSocket response format');
          return;
        }

        const response = typeof wsResponse === 'string' ? JSON.parse(wsResponse) : wsResponse;
        console.log('Parsed Response:', response);

        if (response.code === 200 && response.data) {
          // Trường hợp 1: Response từ booking status update
          if (response.data.bookingCode) {
            console.log('Processing booking update');
            // Lấy thông tin bàn từ bookingTables
            const bookingTableResponses = response.data.bookingTables;
            
            // Update status cho từng bàn trong booking
            bookingTableResponses.forEach(bookingTable => {
              const tableId = bookingTable.barTable.id;
              const newStatus = bookingTable.barTable.status;
              
              setTables(prevTables =>
                prevTables.map(table =>
                  table.id === tableId
                    ? { ...table, status: newStatus }
                    : table
                )
              );
            });
          } 
          // Trường hợp 2: Response từ table status update thông thường
          else {
            const { id: tableId, statusEnum: newStatus, userEmail: ownerEmail } = response.data;
            console.log('Processing single table update:', {
              tableId,
              newStatus,
              ownerEmail
            });

            setTables(prevTables =>
              prevTables.map(table =>
                table.id === tableId
                  ? { ...table, status: newStatus }
                  : table
              )
            );

            // Cập nhật thông tin người giữ bàn
            if (newStatus === 'PENDING') {
              setTableOwners(prev => ({
                ...prev,
                [tableId]: ownerEmail
              }));
            } else if (newStatus === 'EMPTY') {
              setTableOwners(prev => {
                const newOwners = { ...prev };
                delete newOwners[tableId];
                return newOwners;
              });
            }
          }
        } else {
          console.warn('Invalid response format or code:', response);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    // Đảm bảo truyền một function hợp lệ
    if (webSocketService.isWebSocketConnected()) {
      console.log('Subscribing to bar table status updates...');
      const newSubscription = webSocketService.subscribeToBarTableStatus(handleWebSocketMessage);

      if (newSubscription) {
        console.log('Successfully subscribed to updates');
        setSubscription(newSubscription);
      } else {
        console.error('Failed to subscribe to bar table status');
      }
    } else {
      console.warn('WebSocket not connected, cannot subscribe');
    }
  };

  // Hàm xử lý khi click nút Xem bàn
  const handleViewTables = async () => {
    try {
      setLoading(true);
      const formattedTime = formatTimeSlot(selectedTime);

      const response = await getBarTableByDateAndTime(
        formatDateForApi(selectedDate),
        formatTimeForApi(formattedTime)
      );

      if (response.data?.code === 200) {
        setTables(response.data.data);
        setShowLayout(true);

        console.log('Connecting WebSocket...');
        // Đảm bảo WebSocket được kết nối trước khi subscribe
        connectWebSocket(() => {
          console.log('WebSocket connected, subscribing to updates...');
          subscribeToUpdates();
        });
      }
    } catch (error) {
      console.error('Error in handleViewTables:', error);
      setShowLayout(false);
      setTables([]);
      toast.error('Không thể tải dữ liệu bàn. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Hàm format thời gian
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Cập nhật hàm handleSeatClick
  const handleSeatClick = (tableId) => {
    if (!webSocketService.isWebSocketConnected()) {
      toast.error('Mất kết nối với server. Vui lòng tải lại trang!');
      return;
    }

    const table = tables.find(t => t.id === tableId);

    // Chỉ cho phép người giữ bàn có thể hủy
    if (table.status === 'PENDING' && tableOwners[tableId] !== userEmail) {
      toast.warning('Bàn này đang được người khác chọn');
      return;
    }

    const newStatus = table.status === 'PENDING' ? 'EMPTY' : 'PENDING';

    // Cập nhật UI ngay lập tức
    setTables(prevTables =>
      prevTables.map(t =>
        t.id === tableId ? { ...t, status: newStatus } : t
      )
    );

    if (newStatus === 'PENDING') {
      // Lưu thông tin bàn đang chọn
      setMyPendingTables(prev => ({
        ...prev,
        [tableId]: true
      }));

      // Bắt đầu countdown
      startCountdown(tableId);
    } else {
      // Xóa countdown và thông tin bàn khi hủy
      clearTableSelection(tableId);
    }

    // Gửi request cập nhật trạng thái
    webSocketService.sendBarTableStatusUpdateRequest({
      barTableId: tableId,
      bookingDate: formatDateForApi(selectedDate),
      bookingTime: formatTimeForApi(selectedTime),
      status: newStatus,
      userEmail: userEmail
    });
  };

  // Hàm bắt đầu countdown
  const startCountdown = (tableId) => {
    setCountdowns(prev => ({
      ...prev,
      [tableId]: 300 // 5 phút
    }));

    const interval = setInterval(() => {
      setCountdowns(prev => {
        const currentCount = prev[tableId];

        if (currentCount <= 1) {
          clearInterval(interval);
          clearTableSelection(tableId);

          // Reset trạng thái bàn về EMPTY
          webSocketService.sendBarTableStatusUpdateRequest({
            barTableId: tableId,
            bookingDate: formatDateForApi(selectedDate),
            bookingTime: formatTimeForApi(selectedTime),
            status: 'EMPTY',
            userEmail: userEmail
          });

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

    setCountdownIntervals(prev => ({
      ...prev,
      [tableId]: interval
    }));
  };

  // Hàm xóa thông tin bàn đã chọn
  const clearTableSelection = (tableId) => {
    // Xóa countdown
    if (countdownIntervals[tableId]) {
      clearInterval(countdownIntervals[tableId]);
    }

    setCountdownIntervals(prev => {
      const newIntervals = { ...prev };
      delete newIntervals[tableId];
      return newIntervals;
    });

    setCountdowns(prev => {
      const newCountdowns = { ...prev };
      delete newCountdowns[tableId];
      return newCountdowns;
    });

    setMyPendingTables(prev => {
      const newPending = { ...prev };
      delete newPending[tableId];
      return newPending;
    });
  };

  // Cập nhật phần render countdown
  const renderCountdown = () => {
    // Chỉ hiển thị countdown cho các bàn user đang giữ
    const myPendingTableIds = Object.keys(myPendingTables);

    if (myPendingTableIds.length === 0) return null;

    return (
      <CountdownBox>
        <Typography variant="h6" sx={{ color: '#fff', marginBottom: '16px' }}>
          Thời gian còn lại để hoàn tất đặt bàn:
        </Typography>
        <CountdownList>
          {tables
            .filter(table => myPendingTables[table.id])
            .map(table => (
              <CountdownItem key={table.id}>
                <TableName>{table.name}:</TableName>
                <CountdownValue>
                  {formatTime(countdowns[table.id] || 0)}
                </CountdownValue>
              </CountdownItem>
            ))}
        </CountdownList>
      </CountdownBox>
    );
  };

  // Hàm lọc bàn theo loại
  const getTablesByType = (type) => {
    return tables.filter(table => table.tableType.name === type);
  };

  // Hàm kiểm tra trạng thái bàn
  const getTableStatus = (status) => {
    return status;
  };

  // Cập nhật điều kiện disable cho SeatButton
  const isTableDisabled = (status) => {
    // Cho phép tương tác với bàn EMPTY và PENDING
    return status !== 'EMPTY' && status !== 'PENDING';
  };

  // Thêm effect để theo dõi scroll
  useEffect(() => {
    const handleScroll = () => {
      const datePickerPosition = datePickerRef.current?.getBoundingClientRect().top;
      const scrollPosition = window.scrollY;

      // Hiển thị nút khi ở đầu trang và ẩn khi scroll xuống gần date picker
      setShowScrollButton(scrollPosition < (datePickerPosition - 200));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hàm scroll đến date picker
  const scrollToDatePicker = () => {
    datePickerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  // Hàm kiểm tra và cập nhật danh sách bàn đã chọn
  const updateSelectedTables = () => {
    const pendingTables = tables.filter(table => table.status === 'PENDING');
    setSelectedTables(pendingTables);
    return pendingTables.length > 0;
  };

  // Thêm hàm mới để lấy danh sách bàn đang PENDING của user hiện tại
  const getMyPendingTables = () => {
    return tables.filter(table =>
      table.status === 'PENDING' &&
      tableOwners[table.id] === userEmail
    );
  };

  // Sửa lại hàm handleBookingWithDrinks
  const handleBookingWithDrinks = () => {
    const myPendingTablesList = getMyPendingTables();

    if (!myPendingTablesList.length) {
      toast.warning('Vui lòng chọn bàn trước khi tiếp tục');
      return;
    }

    const handleContinueToBookDrinks = () => {
      // Lưu thông tin countdown hiện tại
      const countdownInfo = {
        countdowns: countdowns,
        startTime: Date.now() // Thêm thời điểm bắt đầu
      };

      navigate('/booking/drinks', {
        state: {
          selectedTables: myPendingTablesList,
          selectedDate: formatDateForDisplay(selectedDate),
          selectedTime: formatTimeForApi(selectedTime),
          bookingType: 'WITH_DRINKS',
          countdownInfo // Truyền thông tin countdown
        }
      });
    };

    handleContinueToBookDrinks();
  };

  // Giữ nguyên các hàm khác
  const handleBookNow = () => {
    const hasPendingTables = updateSelectedTables();
    if (!hasPendingTables) {
      toast.warning('Vui lòng chọn ít nhất một bàn trước khi đặt!');
      return;
    }
    setOpenConfirmPopup(true);
  };

  // Hàm xử lý đóng popup
  const handleCloseConfirm = () => {
    setOpenConfirmPopup(false);
  };

  // Hàm xử lý khi xác nhận đặt bàn
  const handleConfirmBooking = async (bookingData) => {
    try {
      const response = await bookingTableOnly(bookingData);

      if (response.data?.code === 200) {
        // Lấy payment link từ response
        const paymentLink = response.data.data.paymentLink;

        // Đóng popup
        setOpenConfirmPopup(false);

        // Reset các trạng thái
        setSelectedTables([]);
        setTables([]);
        setShowLayout(false);

        // Cleanup các countdown
        Object.keys(countdownIntervals).forEach(tableId => {
          clearInterval(countdownIntervals[tableId]);
        });
        setCountdownIntervals({});
        setCountdowns({});
        setMyPendingTables({});

        // Redirect đến trang thanh toán trong tab mới
        if (paymentLink) {
          window.open(paymentLink, '_blank');
        } else {
          toast.error('Không tìm thấy link thanh toán!');
        }

      } else {
        toast.error('Đặt bàn thất bại. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Có lỗi xảy ra khi đặt bàn!');
    }
  };

  const handleBookWithMenu = () => {
    if (selectedTables.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một bàn');
      return;
    }

    navigate('/booking/menus', {
      state: {
        selectedTables,
        selectedDate: formatDateForDisplay(selectedDate),
        selectedTime: formatTimeForApi(selectedTime),
        bookingType: 'BOOKING_WITH_MENU'
      }
    });
  };

  useEffect(() => {
    // Lắng nghe cập nhật trạng thái bàn từ lính gác
    const handleTableUpdate = (event) => {
      const { id: tableId, statusEnum: newStatus } = event.detail;
      
      setTables(prevTables =>
        prevTables.map(table =>
          table.id === tableId
            ? { ...table, status: newStatus }
            : table
        )
      );
    };

    window.addEventListener('tableStatusUpdated', handleTableUpdate);

    return () => {
      window.removeEventListener('tableStatusUpdated', handleTableUpdate);
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Thêm nút scroll */}
      <ScrollButton
        show={showScrollButton}
        onClick={scrollToDatePicker}
        startIcon={<EventSeatIcon />}
      >
        Đặt bàn
      </ScrollButton>

      <TableType />

      <ThemeProvider theme={pickerTheme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Thêm ref cho date picker container */}
          <Box
            ref={datePickerRef}
            sx={{
              backgroundColor: 'rgba(20, 20, 20, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(155, 81, 224, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                '& > *': {
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    width: '0',
                    height: '2px',
                    backgroundColor: '#9b51e0',
                    transition: 'all 0.3s ease',
                    transform: 'translateX(-50%)',
                  },
                  '&:hover::after': {
                    width: '80%',
                  },
                },
              }}
            >
              <DatePicker
                label="Chọn ngày"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                minDate={dayjs()}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    placeholder: 'DD/MM/YYYY',
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        animation: 'fadeIn 0.2s ease-out',
                      }
                    }
                  }
                }}
                sx={commonInputStyles}
              />

              <TimePicker
                label="Chọn giờ"
                value={selectedTime}
                onChange={(newValue) => {
                  const formattedTime = formatTimeSlot(newValue);
                  setSelectedTime(formattedTime);
                }}
                views={['hours']}
                ampm={false}
                minTime={getDefaultTime()}
                maxTime={dayjs().set('hour', 23)}
                slotProps={{
                  textField: {
                    placeholder: 'HH:00',
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        animation: 'fadeIn 0.2s ease-out',
                      }
                    }
                  }
                }}
                sx={commonInputStyles}
              />

              <ViewButton
                onClick={handleViewTables}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Đang tải...' : 'Xem bàn'}
              </ViewButton>
            </Stack>
          </Box>
        </LocalizationProvider>
      </ThemeProvider>

      {/* Chỉ hiển thị layout khi đã click Xem bàn và có dữ liệu */}
      {showLayout && tables.length > 0 && (
        <Box sx={{
          backgroundColor: '#1a1a1a',
          p: 4,
          borderRadius: '12px',
          animation: 'fadeIn 0.5s ease-out',
          marginTop: '32px',
          border: '1px solid rgba(155, 81, 224, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}>
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, color: '#9b51e0' }}>
            SƠ ĐỒ BÀN
          </Typography>

          {renderCountdown()}

          <DoorLabel>Outside Bar</DoorLabel>

          {/* Bar Counter Section - 10 bàn */}
          <BarSection>
            {/* 3 bàn phía trên */}
            <BarCounterRow>
              {getTablesByType('Bar Counter').slice(0, 3).map((table) => (
                <SeatButton
                  key={table.id}
                  status={getTableStatus(table.status)}
                  onClick={() => handleSeatClick(table.id)}
                  disabled={isTableDisabled(table.status)}
                  sx={{
                    animation: table.status === 'PENDING' ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {table.name}
                </SeatButton>
              ))}
            </BarCounterRow>

            {/* 2 bàn hai bên + Bar Area */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* 2 bàn bên trái */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getTablesByType('Bar Counter').slice(3, 5).map((table) => (
                  <SeatButton
                    key={table.id}
                    status={getTableStatus(table.status)}
                    onClick={() => handleSeatClick(table.id)}
                    disabled={isTableDisabled(table.status)}
                    sx={{
                      animation: table.status === 'PENDING' ? 'pulse 1.5s infinite' : 'none'
                    }}
                  >
                    {table.name}
                  </SeatButton>
                ))}
              </Box>

              {/* Bar Area */}
              <BarArea>
                <Typography variant="h6" sx={{ color: '#fff' }}>Bar Counter</Typography>
              </BarArea>

              {/* 2 bàn bên phải */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getTablesByType('Bar Counter').slice(5, 7).map((table) => (
                  <SeatButton
                    key={table.id}
                    status={getTableStatus(table.status)}
                    onClick={() => handleSeatClick(table.id)}
                    disabled={isTableDisabled(table.status)}
                    sx={{
                      animation: table.status === 'PENDING' ? 'pulse 1.5s infinite' : 'none'
                    }}
                  >
                    {table.name}
                  </SeatButton>
                ))}
              </Box>
            </Box>

            {/* 3 bàn phía dưới */}
            <BarCounterRow>
              {getTablesByType('Bar Counter').slice(7, 10).map((table) => (
                <SeatButton
                  key={table.id}
                  status={getTableStatus(table.status)}
                  onClick={() => handleSeatClick(table.id)}
                  disabled={isTableDisabled(table.status)}
                  sx={{
                    animation: table.status === 'PENDING' ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {table.name}
                </SeatButton>
              ))}
            </BarCounterRow>
          </BarSection>

          <DoorLabel>Inside Bar</DoorLabel>

          {/* VIP Booth Section */}
          <SeatSection>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {getTablesByType('VIP Booth').map((table) => (
                <SeatButton
                  key={table.id}
                  status={getTableStatus(table.status)}
                  onClick={() => handleSeatClick(table.id)}
                  disabled={isTableDisabled(table.status)}
                  sx={{
                    animation: table.status === 'PENDING' ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {table.name}
                </SeatButton>
              ))}
            </Box>
          </SeatSection>

          {/* Lounge Bar Section */}
          <Box sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            my: 4,
            '& > *': {
              margin: '0 20px',
            }
          }}>
            {/* 4 bàn bên trái */}
            <LoungeGroup>
              {getTablesByType('Lounge Table').slice(0, 4).map((table) => (
                <SeatButton
                  key={table.id}
                  status={getTableStatus(table.status)}
                  onClick={() => handleSeatClick(table.id)}
                  disabled={isTableDisabled(table.status)}
                  sx={{
                    animation: table.status === 'PENDING' ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {table.name}
                </SeatButton>
              ))}
            </LoungeGroup>

            {/* Bar Area */}
            <BarArea>
              <Typography variant="h6" sx={{ color: '#fff' }}>Bar Counter</Typography>
            </BarArea>

            {/* 4 bàn bên phải */}
            <LoungeGroup>
              {getTablesByType('Lounge Table').slice(4, 8).map((table) => (
                <SeatButton
                  key={table.id}
                  status={getTableStatus(table.status)}
                  onClick={() => handleSeatClick(table.id)}
                  disabled={isTableDisabled(table.status)}
                  sx={{
                    animation: table.status === 'PENDING' ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {table.name}
                </SeatButton>
              ))}
            </LoungeGroup>
          </Box>

          {/* Party Bar Section */}
          <SeatSection>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
              {getTablesByType('Party Table').map((table) => (
                <SeatButton
                  key={table.id}
                  status={getTableStatus(table.status)}
                  onClick={() => handleSeatClick(table.id)}
                  disabled={isTableDisabled(table.status)}
                  sx={{
                    animation: table.status === 'PENDING' ? 'pulse 1.5s infinite' : 'none'
                  }}
                >
                  {table.name}
                </SeatButton>
              ))}
            </Box>
          </SeatSection>

          {/* Legend cập nhật với style mới */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            mt: 4,
            flexWrap: 'wrap',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            pt: 3
          }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '8px 16px',
              borderRadius: '8px'
            }}>
              <Box sx={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50' // Màu xanh cho EMPTY
              }} />
              <Typography sx={{ color: '#fff', fontSize: '14px' }}>Bàn trống</Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '8px 16px',
              borderRadius: '8px'
            }}>
              <Box sx={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FFA726' // Màu cam cho PENDING
              }} />
              <Typography sx={{ color: '#fff', fontSize: '14px' }}>Đang chờ xử lý</Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '8px 16px',
              borderRadius: '8px'
            }}>
              <Box sx={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#F44336' // Màu đỏ cho SERVING
              }} />
              <Typography sx={{ color: '#fff', fontSize: '14px' }}>Đang phục vụ</Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '8px 16px',
              borderRadius: '8px'
            }}>
              <Box sx={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#757575' // Màu xám cho RESERVED
              }} />
              <Typography sx={{ color: '#fff', fontSize: '14px' }}>Đã đặt trước</Typography>
            </Box>
          </Box>

          {/* Booking Actions với style mới */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mt: 6,
            pt: 4,
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {/* Tiêu đề */}
            <Typography
              variant="h6"
              sx={{
                color: '#fff',
                textAlign: 'center',
                mb: 2,
                fontWeight: 500
              }}
            >
              Chọn phương thức đặt bàn
            </Typography>

            {/* Container cho các nút */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="stretch"
              sx={{
                width: '100%',
                maxWidth: '1000px',
                margin: '0 auto',
                px: 2
              }}
            >
              <BookingButton
                startIcon={<RestaurantMenuIcon />}
                onClick={handleBookWithMenu}
                sx={{
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 152, 0, 0.2)',
                  }
                }}
              >
                Đặt bàn kèm theo thực đơn
              </BookingButton>

              <BookingButton
                startIcon={<LocalBarIcon />}
                onClick={handleBookingWithDrinks}
                sx={{
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                  }
                }}
              >
                Đặt bàn kèm theo thức uống
              </BookingButton>

              <BookingButton
                startIcon={<EventSeatIcon />}
                onClick={handleBookNow}
                sx={{
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  }
                }}
              >
                Đặt bàn ngay
              </BookingButton>
            </Stack>
            {/* Ghi chú */}
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'center',
                mt: 2,
                fontSize: '0.9rem'
              }}
            >
              * Đặt bàn kèm theo thực đơn hoặc thức uống sẽ không tính phí đặt bàn
            </Typography>
          </Box>
        </Box>
      )}

      {/* Hiển thị thông báo khi không có dữ liệu */}
      {showLayout && tables.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4, color: '#fff' }}>
          <Typography>
            Không có bàn nào khả dụng cho thời gian đã chọn.
          </Typography>
          <Typography>
            Vui lòng chọn thời gian khác.
          </Typography>
        </Box>
      )}

      {/* Thêm ConfirmPopup */}
      <ConfirmPopup
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        open={openConfirmPopup}
        onClose={handleCloseConfirm}
        selectedTables={selectedTables}
        onConfirm={handleConfirmBooking}
      />
    </Container>
  );
};

// Thêm keyframes cho animation vào file CSS hoặc styled-components
const fadeInKeyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const pulseKeyframes = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

export default BookingTable;


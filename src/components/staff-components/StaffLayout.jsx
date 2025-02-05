import React, { useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import StaffHeader from './StaffHeader';
import StaffFooter from './StaffFooter';
import StaffSidebar from './StaffSidebar';
import ScrollToTop from '../common-components/ScrollToTop';
import webSocketService from 'src/libs/web-socket/web-socket';
import useAuthStore from 'src/libs/hooks/useUserStore';

const StaffLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let subscription = null;

    // "Lính gác" WebSocket
    const setupWebSocketGuard = () => {
      console.log('Setting up WebSocket guard...');
      
      webSocketService.connect(
        () => {
          console.log('WebSocket guard connected');
          
          // Lính gác túc trực nhận message
          subscription = webSocketService.subscribeToBarTableStatus((response) => {
            console.log('Guard received message:', response);
            
            // Xử lý các loại message khác nhau
            if (response?.code === 200 && response?.data) {
              // Trường hợp 1: Update booking status
              if (response.data.bookingCode) {
                const bookingData = response.data;
                console.log('Booking status updated:', bookingData);
                
                // Broadcast event để các component con có thể lắng nghe
                const event = new CustomEvent('bookingStatusUpdated', {
                  detail: bookingData
                });
                window.dispatchEvent(event);
              }
              
              // Trường hợp 2: Update table status
              else {
                const tableData = response.data;
                console.log('Table status updated:', tableData);
                
                const event = new CustomEvent('tableStatusUpdated', {
                  detail: tableData
                });
                window.dispatchEvent(event);
              }
            }
          });
        },
        (error) => {
          console.error('WebSocket guard connection error:', error);
          // Thử kết nối lại sau 5 giây
          setTimeout(setupWebSocketGuard, 5000);
        }
      );
    };

    // Khởi tạo lính gác
    setupWebSocketGuard();

    // Cleanup khi component unmount
    return () => {
      if (subscription) {
        console.log('Relieving WebSocket guard from duty');
        subscription.unsubscribe();
      }
      webSocketService.disconnect();
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <StaffSidebar />

      {/* Main Content Wrapper */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          width: { sm: `calc(100% - 280px)` },
          ml: { sm: '280px' },
          transition: 'margin-left 0.3s ease, width 0.3s ease',
        }}
      >
        {/* Header */}
        <StaffHeader />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: '64px', // Height of header
            backgroundColor: '#1a1a1a',
            minHeight: `calc(100vh - 64px - 60px)`, // viewport - header - footer
          }}
        >
          <ScrollToTop />
          <Outlet />
        </Box>

        {/* Footer */}
        <StaffFooter />
      </Box>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </Box>
  );
};

export default StaffLayout; 
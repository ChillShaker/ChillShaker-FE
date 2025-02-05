import React from 'react';
import { Box, Typography } from '@mui/material';

const StaffFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        height: '60px', // Fixed height
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderTop: '1px solid rgba(155, 81, 224, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Typography 
        variant="body2" 
        align="center"
        sx={{ 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.875rem' 
        }}
      >
        © {new Date().getFullYear()} Chill Shaker Bar. All rights reserved.
      </Typography>
    </Box>
  );
};

export default StaffFooter; 
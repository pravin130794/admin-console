import React from 'react';
import { Box, Typography } from '@mui/material';

const DashboardPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to the Dashboard
      </Typography>
      <Typography>
        This is the root page of your admin dashboard. Use the sidebar to navigate to other pages.
      </Typography>
    </Box>
  );
};

export default DashboardPage;

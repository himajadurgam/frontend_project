import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        EduAssign
      </Typography>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Assignment Submission System
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/auth')}
        sx={{ mt: 2 }}
      >
        Get Started
      </Button>
    </Box>
  );
};

export default LandingPage;
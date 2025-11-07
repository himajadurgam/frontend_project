// src/components/AuthPage.js
import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import { School } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setRole: setUserRole } = useApp();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, data.email, data.password);
        alert('Login successful!');
      } else {
        result = await createUserWithEmailAndPassword(auth, data.email, data.password);
        alert('Account created successfully!');
      }
      
      // Set the user role in context
      setUserRole(role);
      
      // Redirect based on role
      if (role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              EduAssign
            </Typography>
          </Box>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <School sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold">
              Welcome to EduAssign
            </Typography>
            <Typography color="textSecondary">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: 4 }}>
              {/* Role Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  I am a:
                </Typography>
                <ToggleButtonGroup
                  value={role}
                  exclusive
                  onChange={(e, newRole) => newRole && setRole(newRole)}
                  fullWidth
                >
                  <ToggleButton value="student">
                    Student
                  </ToggleButton>
                  <ToggleButton value="teacher">
                    Teacher
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                {!isLogin && (
                  <TextField
                    fullWidth
                    label="Full Name"
                    margin="normal"
                    {...register('name', { required: 'Name is required' })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
                
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  margin="normal"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  margin="normal"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              {/* Toggle Login/Register */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    reset();
                    setError('');
                  }}
                >
                  {isLogin 
                    ? "Don't have an account? Sign up" 
                    : 'Already have an account? Sign in'
                  }
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthPage;

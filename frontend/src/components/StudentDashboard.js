// src/components/StudentDashboard.js
import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress,
  Alert,
  Input,
  FormControl,
  FormHelperText,
} from '@mui/material';
import {
  Assignment,
  Grade,
  CloudUpload,
  Logout,
  Dashboard,
  CheckCircle,
  PendingActions,
} from '@mui/icons-material';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const StudentDashboard = () => {
  const { assignments, submissions, submitAssignment } = useApp();
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedFile || !selectedAssignment) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Submit assignment to Firebase
      const result = await submitAssignment({
        assignmentId: selectedAssignment.id,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        // In a real app, you would upload the file to Firebase Storage first
        // fileURL: downloadURL from Firebase Storage
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setTimeout(() => {
          setOpenSubmitDialog(false);
          setSelectedFile(null);
          setSelectedAssignment(null);
          setUploadProgress(0);
          alert('Assignment submitted successfully!');
        }, 500);
      } else {
        alert('Error submitting assignment: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isSubmitted = (assignmentId) => {
    return submissions.some(sub => sub.assignmentId === assignmentId && sub.studentId === auth.currentUser?.uid);
  };

  const getSubmission = (assignmentId) => {
    return submissions.find(sub => sub.assignmentId === assignmentId && sub.studentId === auth.currentUser?.uid);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getGradeStats = () => {
    const mySubmissions = submissions.filter(sub => sub.studentId === auth.currentUser?.uid);
    const gradedSubmissions = mySubmissions.filter(sub => sub.status === 'graded' && sub.grade !== undefined);
    if (gradedSubmissions.length === 0) return { average: 0, total: 0 };
    
    const total = gradedSubmissions.reduce((sum, sub) => sum + sub.grade, 0);
    const average = total / gradedSubmissions.length;
    
    return { average: Math.round(average), total: gradedSubmissions.length };
  };

  const stats = getGradeStats();
  const mySubmissions = submissions.filter(sub => sub.studentId === auth.currentUser?.uid);

  return (
    <Box>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {auth.currentUser?.email}
          </Typography>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {auth.currentUser?.email?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assignment sx={{ color: 'primary.main', mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {assignments.length}
                    </Typography>
                    <Typography color="textSecondary">
                      Total Assignments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ color: 'success.main', mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {mySubmissions.length}
                    </Typography>
                    <Typography color="textSecondary">
                      Submitted
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Grade sx={{ color: 'warning.main', mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.average}%
                    </Typography>
                    <Typography color="textSecondary">
                      Average Grade
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PendingActions sx={{ color: 'info.main', mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {assignments.length - mySubmissions.length}
                    </Typography>
                    <Typography color="textSecondary">
                      Pending
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Assignments */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Available Assignments
            </Typography>

            {assignments.length === 0 ? (
              <Alert severity="info">
                No assignments available at the moment. Your teacher will post assignments here.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Assignment</strong></TableCell>
                      <TableCell><strong>Due Date</strong></TableCell>
                      <TableCell><strong>Max Points</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Grade</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => {
                      const submission = getSubmission(assignment.id);
                      const submitted = isSubmitted(assignment.id);
                      const overdue = isOverdue(assignment.dueDate);

                      return (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {assignment.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {assignment.description.slice(0, 60)}...
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              color={overdue ? 'error' : 'textPrimary'}
                              fontWeight={overdue ? 'bold' : 'normal'}
                            >
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </Typography>
                            {overdue && !submitted && (
                              <Typography variant="caption" color="error">
                                Overdue
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{assignment.maxPoints}</TableCell>
                          <TableCell>
                            {submitted ? (
                              <Chip 
                                label={submission?.status || 'Submitted'}
                                color={submission?.status === 'graded' ? 'success' : 'warning'}
                                size="small"
                              />
                            ) : (
                              <Chip 
                                label={overdue ? 'Overdue' : 'Not Submitted'}
                                color={overdue ? 'error' : 'default'}
                                size="small"
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {submission?.grade !== undefined ? (
                              <Box>
                                <Typography fontWeight="bold" color="success.main">
                                  {submission.grade}/{assignment.maxPoints}
                                </Typography>
                                <Typography variant="caption">
                                  ({Math.round((submission.grade / assignment.maxPoints) * 100)}%)
                                </Typography>
                              </Box>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {!submitted && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CloudUpload />}
                                onClick={() => {
                                  setSelectedAssignment(assignment);
                                  setOpenSubmitDialog(true);
                                }}
                                color={overdue ? 'error' : 'primary'}
                              >
                                {overdue ? 'Late Submit' : 'Submit'}
                              </Button>
                            )}
                            {submitted && submission?.feedback && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => alert(`Feedback: ${submission.feedback}`)}
                              >
                                View Feedback
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        {mySubmissions.filter(sub => sub.status === 'graded').length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Recent Grades & Performance
              </Typography>
              <Grid container spacing={2}>
                {mySubmissions
                  .filter(sub => sub.status === 'graded')
                  .map((submission) => {
                    const assignment = assignments.find(a => a.id === submission.assignmentId);
                    const percentage = assignment ? Math.round((submission.grade / assignment.maxPoints) * 100) : 0;
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={submission.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {assignment?.title || 'Unknown Assignment'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ mr: 2 }}>
                                {submission.grade}/{assignment?.maxPoints || 100}
                              </Typography>
                              <Chip 
                                label={`${percentage}%`}
                                color={percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error'}
                                size="small"
                              />
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage} 
                              sx={{ mb: 1 }}
                              color={percentage >= 80 ? 'success' : percentage >= 60 ? 'warning' : 'error'}
                            />
                            {submission.feedback && (
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                "{submission.feedback.slice(0, 50)}..."
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Submit Assignment Dialog */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Submit Assignment: {selectedAssignment?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Due Date:</strong> {selectedAssignment && new Date(selectedAssignment.dueDate).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Max Points:</strong> {selectedAssignment?.maxPoints}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              <strong>Description:</strong> {selectedAssignment?.description}
            </Typography>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Input
              type="file"
              onChange={handleFileSelect}
              inputProps={{
                accept: '.pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.png'
              }}
            />
            <FormHelperText>
              Supported formats: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (Max: 10MB)
            </FormHelperText>
          </FormControl>

          {selectedFile && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Selected file: <strong>{selectedFile.name}</strong> ({Math.round(selectedFile.size / 1024)} KB)
            </Alert>
          )}

          {uploading && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Uploading... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setOpenSubmitDialog(false);
              setSelectedFile(null);
              setSelectedAssignment(null);
              setUploadProgress(0);
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAssignment}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Submit Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
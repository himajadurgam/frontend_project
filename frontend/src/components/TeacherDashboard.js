// src/components/TeacherDashboard.js
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
  TextField,
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
  Alert,
} from '@mui/material';
import {
  Add,
  Assignment,
  People,
  Grade,
  Logout,
  Dashboard,
  CloudUpload,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const TeacherDashboard = () => {
  const { assignments, submissions, createAssignment, gradeSubmission } = useApp();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: gradeRegister, handleSubmit: handleGradeSubmit, reset: gradeReset } = useForm();

  const handleCreateAssignment = async (data) => {
    const result = await createAssignment({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      maxPoints: parseInt(data.maxPoints),
    });
    
    if (result.success) {
      setOpenCreateDialog(false);
      reset();
      alert('Assignment created successfully!');
    } else {
      alert('Error creating assignment: ' + result.error);
    }
  };

  const handleGradeSubmission = async (data) => {
    const result = await gradeSubmission(selectedSubmission.id, data.grade, data.feedback);
    
    if (result.success) {
      setOpenGradeDialog(false);
      gradeReset();
      setSelectedSubmission(null);
      alert('Grade submitted successfully!');
    } else {
      alert('Error grading submission: ' + result.error);
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

  const getSubmissionCount = (assignmentId) => {
    return submissions.filter(sub => sub.assignmentId === assignmentId).length;
  };

  const getGradedCount = (assignmentId) => {
    return submissions.filter(
      sub => sub.assignmentId === assignmentId && sub.status === 'graded'
    ).length;
  };

  return (
    <Box>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Dashboard sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Teacher Dashboard
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
                  <CloudUpload sx={{ color: 'success.main', mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {submissions.length}
                    </Typography>
                    <Typography color="textSecondary">
                      Total Submissions
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
                      {submissions.filter(s => s.status === 'graded').length}
                    </Typography>
                    <Typography color="textSecondary">
                      Graded
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
                  <People sx={{ color: 'info.main', mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {submissions.filter(s => s.status === 'submitted').length}
                    </Typography>
                    <Typography color="textSecondary">
                      Pending Review
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Assignments Table */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Your Assignments
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Create Assignment
              </Button>
            </Box>

            {assignments.length === 0 ? (
              <Alert severity="info">
                No assignments created yet. Click "Create Assignment" to get started!
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Title</strong></TableCell>
                      <TableCell><strong>Due Date</strong></TableCell>
                      <TableCell><strong>Max Points</strong></TableCell>
                      <TableCell><strong>Submissions</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {assignment.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {assignment.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{assignment.maxPoints}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${getGradedCount(assignment.id)}/${getSubmissionCount(assignment.id)} graded`}
                            color={getGradedCount(assignment.id) === getSubmissionCount(assignment.id) && getSubmissionCount(assignment.id) > 0 ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={assignment.status}
                            color={assignment.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
              Recent Submissions
            </Typography>
            
            {submissions.length === 0 ? (
              <Alert severity="info">
                No submissions yet. Students will see assignments once they sign up.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Student</strong></TableCell>
                      <TableCell><strong>Assignment</strong></TableCell>
                      <TableCell><strong>Submitted</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Grade</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((submission) => {
                      const assignment = assignments.find(a => a.id === submission.assignmentId);
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>{submission.studentEmail}</TableCell>
                          <TableCell>{assignment?.title || 'Unknown Assignment'}</TableCell>
                          <TableCell>
                            {submission.submittedAt?.toLocaleDateString?.() || new Date(submission.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={submission.status}
                              color={submission.status === 'graded' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {submission.grade ? `${submission.grade}/${assignment?.maxPoints || 100}` : '-'}
                          </TableCell>
                          <TableCell>
                            {submission.status !== 'graded' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setOpenGradeDialog(true);
                                }}
                              >
                                Grade
                              </Button>
                            )}
                            {submission.status === 'graded' && (
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => alert(`Feedback: ${submission.feedback || 'No feedback provided'}`)}
                              >
                                View
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
      </Container>

      {/* Create Assignment Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Assignment</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateAssignment)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Assignment Title"
              margin="normal"
              {...register('title', { required: 'Title is required' })}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              margin="normal"
              {...register('description', { required: 'Description is required' })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...register('dueDate', { required: 'Due date is required' })}
              error={!!errors.dueDate}
              helperText={errors.dueDate?.message}
            />
            <TextField
              fullWidth
              label="Maximum Points"
              type="number"
              margin="normal"
              {...register('maxPoints', { required: 'Max points is required' })}
              error={!!errors.maxPoints}
              helperText={errors.maxPoints?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Assignment</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Grade Submission Dialog */}
      <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Grade Submission</DialogTitle>
        <form onSubmit={handleGradeSubmit(handleGradeSubmission)}>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Student: {selectedSubmission?.studentEmail}
            </Typography>
            <TextField
              fullWidth
              label="Grade (0-100)"
              type="number"
              margin="normal"
              inputProps={{ min: 0, max: 100 }}
              {...gradeRegister('grade', { required: 'Grade is required' })}
            />
            <TextField
              fullWidth
              label="Feedback (Optional)"
              multiline
              rows={4}
              margin="normal"
              {...gradeRegister('feedback')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGradeDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit Grade</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TeacherDashboard;

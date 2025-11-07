// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setUserRole(null);
        setAssignments([]);
        setSubmissions([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load assignments in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const assignmentData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate,
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setAssignments(assignmentData);
    }, (error) => {
      console.error('Error loading assignments:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Load submissions in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const submissionData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate?.() || new Date(),
        gradedAt: doc.data().gradedAt?.toDate?.() || null
      }));
      setSubmissions(submissionData);
    }, (error) => {
      console.error('Error loading submissions:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Create assignment
  const createAssignment = async (assignmentData) => {
    try {
      await addDoc(collection(db, 'assignments'), {
        ...assignmentData,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: new Date(),
        status: 'active'
      });
      return { success: true };
    } catch (error) {
      console.error('Error creating assignment:', error);
      return { success: false, error: error.message };
    }
  };

  // Submit assignment
  const submitAssignment = async (submissionData) => {
    try {
      await addDoc(collection(db, 'submissions'), {
        ...submissionData,
        studentId: user.uid,
        studentEmail: user.email,
        submittedAt: new Date(),
        status: 'submitted'
      });
      return { success: true };
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return { success: false, error: error.message };
    }
  };

  // Grade submission
  const gradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        grade: parseInt(grade),
        feedback: feedback || '',
        status: 'graded',
        gradedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Error grading submission:', error);
      return { success: false, error: error.message };
    }
  };

  // Set user role
  const setRole = (role) => {
    setUserRole(role);
  };

  const value = {
    user,
    userRole,
    assignments,
    submissions,
    loading,
    createAssignment,
    submitAssignment,
    gradeSubmission,
    setRole
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

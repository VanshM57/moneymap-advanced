import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Loader from './Loader/Loader';

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after loading completes
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Show loader while auth is loading
  if (loading) {
    return <Loader />;
  }

  // If user is authenticated, render the component
  if (user) {
    return children;
  }

  // User is not authenticated, will be redirected by useEffect
  return null;
};

export default ProtectedRoute;

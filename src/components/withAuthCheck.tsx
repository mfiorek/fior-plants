import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Higher-Order Component:
// This function takes a component...
export const withAuthCheck = (Component: React.FC<{ children?: React.ReactNode }>, isAuthRequired: boolean) => {
  // ...and returns another component...
  return (props: { children?: React.ReactNode }) => {
    const { currentUser } = useAuth();

    if (isAuthRequired && !currentUser) {
      return <Navigate replace to='/login' />;
    }
    if (!isAuthRequired && currentUser) {
      return <Navigate replace to='/' />;
    }
    return <Component {...props} />;
  };
};

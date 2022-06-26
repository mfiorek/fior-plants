import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { User } from 'firebase/auth';

interface IAuthContext {
  currentUser: User | null;
  isAdmin: boolean | null;
}

const AuthContext = React.createContext<IAuthContext>({} as IAuthContext);

export function useAuth() {
  return useContext(AuthContext);
}

type AuthProviderProps = {
  children?: React.ReactNode
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('user', user?.email, user?.uid);
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged((user) => {
      user?.getIdTokenResult().then((token) => {
        console.log('isAdmin', !!token.claims.isAdmin);
        setIsAdmin(!!token.claims.isAdmin);
      });
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
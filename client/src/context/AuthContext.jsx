import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, logout } from '../redux/slices/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          await dispatch(fetchProfile()).unwrap();
        } catch {
          dispatch(logout());
        }
      }
      setIsInitialized(true);
    };
    init();
  }, [dispatch]);

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  const isAdmin = hasRole('super_admin', 'admin');
  const isMentor = hasRole('mentor');
  const isStudent = hasRole('student');

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isInitialized, hasRole, isAdmin, isMentor, isStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout, clearError, fetchProfile, updateProfile } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const loginUser = async (credentials, redirectPath) => {
    const result = await dispatch(login(credentials));
    if (login.fulfilled.match(result)) {
      const role = result.payload.user.role;
      const redirects = {
        super_admin: '/admin/dashboard',
        admin: '/admin/dashboard',
        mentor: '/mentor/dashboard',
        student: '/student/dashboard',
      };
      navigate(redirectPath || redirects[role] || '/dashboard');
    }
    return result;
  };

  const registerUser = async (userData) => {
    return await dispatch(register(userData));
  };

  const logoutUser = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getProfile = () => dispatch(fetchProfile());
  const updateUserProfile = (data) => dispatch(updateProfile(data));
  const clearAuthError = () => dispatch(clearError());

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    getProfile,
    updateProfile: updateUserProfile,
    clearError: clearAuthError,
  };
};

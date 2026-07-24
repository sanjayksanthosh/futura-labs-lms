import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    const redirects = {
      super_admin: '/admin/dashboard',
      admin: '/admin/dashboard',
      mentor: '/mentor/dashboard',
      student: '/student/dashboard',
    };
    return <Navigate to={redirects[user?.role] || '/login'} replace />;
  }

  return children;
};

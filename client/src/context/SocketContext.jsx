import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '../redux/slices/uiSlice';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let newSocket;
    try {
      newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: false,
      });

      newSocket.on('connect', () => {
        newSocket.emit('join', user._id || user.id);
      });

      newSocket.on('notification', (notification) => {
        dispatch(addNotification(notification));
      });

      newSocket.on('connect_error', () => {});

      setSocket(newSocket);
    } catch {
      // Socket not available in production — app still works without it
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [isAuthenticated, user, dispatch]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Moon, Sun, Search, Menu, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { toggleSidebar, toggleTheme, markAllAsRead } from '../redux/slices/uiSlice';
import { useAuth } from '../hooks/useAuth';
import { notificationService } from '../services/endpoints';
import { cn } from '../utils/cn';
import { Avatar } from '../components/ui/Avatar';
import { useFetch } from '../hooks/useQuery';

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme } = useSelector((state) => state.ui);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notifData } = useFetch('notifications', () => notificationService.getAll({ limit: 10 }), {
    refetchInterval: 30000,
  });

  const notifications = notifData?.data || [];
  const unreadCount = notifData?.unreadCount || 0;

  useEffect(() => {
    const handleClick = () => { setShowNotifications(false); setShowProfile(false); };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <form onSubmit={handleSearch} className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 py-2 w-64 lg:w-80 bg-slate-50 dark:bg-slate-800/50"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-12 w-80 glass rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => dispatch(markAllAsRead())}
                      className="text-xs text-primary-500 hover:text-primary-600"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-sm text-slate-500">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={cn(
                          'px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0',
                          !notif.isRead && 'bg-primary-50/50 dark:bg-primary-900/10'
                        )}
                        onClick={() => {
                          if (notif.link) navigate(notif.link);
                          setShowNotifications(false);
                        }}
                      >
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Avatar name={user?.name} size="sm" />
            </button>

            {showProfile && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-12 w-56 glass rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden p-2"
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <hr className="border-slate-200 dark:border-slate-700 my-1" />
                <button
                  onClick={() => { navigate(`/${user?.role === 'student' ? 'student' : user?.role === 'mentor' ? 'mentor' : 'admin'}/settings`); setShowProfile(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
                >
                  <SettingsIcon className="h-4 w-4" /> Settings
                </button>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

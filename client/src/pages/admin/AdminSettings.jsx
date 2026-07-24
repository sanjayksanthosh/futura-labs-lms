import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../../redux/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { useMutate } from '../../hooks/useQuery';
import { userService } from '../../services/endpoints';
import { Shield, Bell, Lock, Palette, User, Smartphone, Globe, Moon, Sun } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, sms: false, digest: 'daily' });

  const updateProfileMut = useMutate((d) => userService.update(user?._id, d), { invalidateKeys: ['profile'] });
  const changePasswordMut = useMutate((d) => userService.changePassword(user?._id, d));

  const handleProfile = (e) => {
    e.preventDefault();
    updateProfileMut.mutate(profile);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    changePasswordMut.mutate(
      { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
      { onSuccess: () => setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4 text-primary-500" /> Profile</h3>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email || ''} disabled className="input-field opacity-60" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Role</label>
              <input value={user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || ''} disabled className="input-field opacity-60" />
            </div>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} className="input-field" rows={3} placeholder="Tell us about yourself" />
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-primary-500" /> Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} type="password" placeholder="Current Password" className="input-field" />
            <input value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} type="password" placeholder="New Password" className="input-field" minLength={6} />
            <input value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} type="password" placeholder="Confirm Password" className="input-field" />
          </div>
          <button type="submit" className="btn-primary">Update Password</button>
        </form>
      </div>

      {/* Theme */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Palette className="h-4 w-4 text-primary-500" /> Appearance</h3>
        <div className="flex gap-3">
          {[
            { key: 'light', icon: Sun, label: 'Light' },
            { key: 'dark', icon: Moon, label: 'Dark' },
          ].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => dispatch(setTheme(key))} className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all ${theme === key ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <Icon className={`h-4 w-4 ${theme === key ? 'text-primary-500' : 'text-slate-400'}`} />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-primary-500" /> Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'push', label: 'Push Notifications', desc: 'Receive in-app notifications' },
            { key: 'sms', label: 'SMS Notifications', desc: 'Receive text message updates' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
              <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-slate-500">{desc}</p></div>
              <input type="checkbox" checked={notifPrefs[key]} onChange={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))} className="toggle" />
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../../redux/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const StudentSettings = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const { user, updateProfile, changePassword } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    toast.success('Saved');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    try {
      await changePassword(passForm);
      toast.success('Password changed');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1></div>
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold">Profile</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="Phone" />
          <button type="submit" className="btn-primary">Save</button>
        </form>
      </div>
      <div className="glass rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input type="password" placeholder="Current password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} className="input-field" required />
          <input type="password" placeholder="New password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} className="input-field" required minLength={6} />
          <input type="password" placeholder="Confirm password" value={passForm.confirmPassword} onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} className="input-field" required />
          <button type="submit" className="btn-primary">Change Password</button>
        </form>
      </div>
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Theme</h3>
        <div className="flex gap-3">
          {['light', 'dark'].map((t) => (
            <button key={t} onClick={() => dispatch(setTheme(t))} className={`px-6 py-3 rounded-xl border-2 ${theme === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <span className="capitalize font-medium">{t}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

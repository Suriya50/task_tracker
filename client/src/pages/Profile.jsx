import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, UserIcon, EnvelopeIcon, KeyIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';
import { logout, updateUser } from '../redux/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [preview, setPreview] = useState(user?.profilePicture || 'https://ui-avatars.com/api/?background=6366f1&color=fff&size=100');

  // ─── AVATAR UPLOAD ───
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newAvatarUrl = res.data.data.profilePicture;
      setPreview(newAvatarUrl);

      // ✅ Update Redux state and localStorage
      dispatch(updateUser({ profilePicture: newAvatarUrl }));

      toast.success('Avatar updated!');
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  };

  // ─── UPDATE PROFILE ───
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', { name, email });
      // Update Redux with new name/email
      dispatch(updateUser({ name, email }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  // ─── CHANGE PASSWORD ───
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.error('Fill all fields');
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  // ─── LOGOUT ───
  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8 max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-white mb-4">Profile</h1>

          {/* Avatar */}
          <div className="glass-card rounded-2xl p-5 mb-5 flex flex-col items-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <img src={preview} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-primary/30" />
              <label className="absolute bottom-0 right-0 p-1 rounded-full bg-primary cursor-pointer hover:bg-secondary transition">
                <CameraIcon className="w-3.5 h-3.5 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <p className="text-white font-medium mt-2 text-sm">{user?.name}</p>
            <p className="text-gray-400 text-xs">{user?.role}</p>
          </div>

          {/* Update Profile */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-white mb-3">Update Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-glass-with-icon text-xs py-1.5 pl-7" required />
              </div>
              <div className="relative">
                <EnvelopeIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass-with-icon text-xs py-1.5 pl-7" required />
              </div>
              <button type="submit" className="btn-primary text-xs py-2">Update</button>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h2 className="text-sm font-semibold text-white mb-3">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="relative">
                <KeyIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" placeholder="Current" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-glass-with-icon text-xs py-1.5 pl-7" required />
              </div>
              <div className="relative">
                <KeyIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" placeholder="New" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-glass-with-icon text-xs py-1.5 pl-7" required />
              </div>
              <button type="submit" className="btn-primary text-xs py-2">Change</button>
            </form>
          </div>

          {/* Logout */}
          <div className="glass-card rounded-2xl p-5 border border-red-500/20">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition text-xs">
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
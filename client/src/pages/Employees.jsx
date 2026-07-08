import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlusIcon, TrashIcon, PencilIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getUsers, deleteUser, updateUser } from '../redux/slices/userSlice';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const Employees = () => {
  const dispatch = useDispatch();
  const { users = [], loading } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Employee', password: 'password123' });

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await dispatch(updateUser({ id: editing._id, userData: { name: formData.name, email: formData.email, role: formData.role } }));
        toast.success('User updated');
      } else {
        await api.post('/auth/register', { ...formData, companyName: user.company });
        toast.success('User added');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', email: '', role: 'Employee', password: 'password123' });
      dispatch(getUsers());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      const result = await dispatch(deleteUser(id));
      if (deleteUser.fulfilled.match(result)) toast.success('User deleted');
    }
  };

  const handleEdit = (u) => {
    setEditing(u);
    setFormData({ name: u.name, email: u.email, role: u.role, password: '' });
    setShowModal(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-darkBg"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>;

  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Team Members</h1>
              <p className="text-gray-400 text-sm">Manage employees and managers</p>
            </div>
            <button onClick={() => { setEditing(null); setFormData({ name: '', email: '', role: 'Employee', password: 'password123' }); setShowModal(true); }} className="btn-primary-sm flex items-center gap-2">
              <UserPlusIcon className="w-5 h-5" /> Add Member
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-white text-xs font-bold">
                        {u.name?.charAt(0)}
                      </div>
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' :
                        u.role === 'Manager' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleEdit(u)} className="text-blue-400 hover:text-blue-300"><PencilIcon className="w-4 h-4" /></button>
                      {u._id !== user?._id && (
                        <button onClick={() => handleDelete(u._id)} className="text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-400"><UserGroupIcon className="w-12 h-12 mx-auto text-gray-600 mb-2" />No users</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">{editing ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-glass" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-glass" required />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Temporary Password</label>
                  <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-glass" required />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input-glass">
                  <option>Employee</option><option>Manager</option><option>Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">{editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
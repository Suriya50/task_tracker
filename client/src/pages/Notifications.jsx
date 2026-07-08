import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { getNotifications, markAsRead, markAllAsRead } from '../redux/slices/notificationSlice';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications = [], unreadCount, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleMarkRead = async (id) => {
    await dispatch(markAsRead(id));
    toast.success('Marked as read');
  };

  const handleMarkAllRead = async () => {
    await dispatch(markAllAsRead());
    toast.success('All marked as read');
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
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-gray-400 text-sm">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn-primary-sm">Mark All Read</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <BellIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div key={n._id} className={`glass-card rounded-2xl p-4 flex items-start justify-between transition-all ${n.read ? 'opacity-60' : 'border-primary/30'}`}>
                  <div>
                    <p className="text-white font-medium">{n.title}</p>
                    <p className="text-gray-400 text-sm">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n._id)} className="text-primary hover:text-secondary">
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notifications;
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  HomeIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../../redux/slices/authSlice'; // ✅ Correct path

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Projects', href: '/projects', icon: FolderIcon, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Employees', href: '/employees', icon: UserGroupIcon, roles: ['Admin', 'Manager'] },
    { name: 'Meetings', href: '/meetings', icon: CalendarIcon, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Reports', href: '/reports', icon: DocumentTextIcon, roles: ['Admin', 'Manager', 'Employee'] },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon, roles: ['Admin', 'Manager', 'Employee'] },
  ];

  const filteredNav = navigation.filter(item => item.roles.includes(user?.role || 'Employee'));

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-card text-white"
      >
        {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`
          glass-sidebar fixed top-0 left-0 h-full w-64 z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-sm">MD</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MissionDesk
            </span>
          </div>

          {/* User Profile with Avatar */}
          <div className="px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
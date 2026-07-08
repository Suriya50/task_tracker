import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
  UserPlusIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { getProjects } from '../redux/slices/projectSlice';
import { getTasks } from '../redux/slices/taskSlice';
import { getUsers } from '../redux/slices/userSlice';
import { getNotifications } from '../redux/slices/notificationSlice';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import StatsCard from '../components/common/StatsCard';
import ActivityItem from '../components/common/ActivityItem';
import Loader from '../components/common/Loader';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { projects = [] } = useSelector((state) => state.projects);
  const { tasks = [] } = useSelector((state) => state.tasks);
  const { users = [] } = useSelector((state) => state.users);
  const { loading } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getTasks());
    dispatch(getUsers());
    dispatch(getNotifications());
  }, [dispatch]);

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const isEmployee = user?.role === 'Employee';

  const totalEmployees = users.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  const stats = isAdmin
    ? [
        { title: 'Total Employees', value: totalEmployees, icon: UsersIcon, color: 'from-blue-500/20 to-blue-600/20' },
        { title: 'Total Projects', value: totalProjects, icon: FolderIcon, color: 'from-purple-500/20 to-purple-600/20' },
        { title: 'Pending Tasks', value: pendingTasks, icon: ClockIcon, color: 'from-orange-500/20 to-orange-600/20' },
        { title: 'Completed Tasks', value: completedTasks, icon: CheckCircleIcon, color: 'from-green-500/20 to-green-600/20' },
      ]
    : isManager
    ? [
        { title: 'Team Members', value: totalEmployees, icon: UserGroupIcon, color: 'from-blue-500/20 to-blue-600/20' },
        { title: 'Active Projects', value: activeProjects, icon: FolderIcon, color: 'from-purple-500/20 to-purple-600/20' },
        { title: 'In Progress', value: inProgressTasks, icon: ChartBarIcon, color: 'from-yellow-500/20 to-yellow-600/20' },
        { title: 'Completed Tasks', value: completedTasks, icon: CheckCircleIcon, color: 'from-green-500/20 to-green-600/20' },
      ]
    : [
        { title: 'My Tasks', value: tasks.filter(t => t.assignedTo?._id === user?._id).length, icon: ClipboardDocumentListIcon, color: 'from-blue-500/20 to-blue-600/20' },
        { title: 'Completed', value: tasks.filter(t => t.assignedTo?._id === user?._id && t.status === 'Completed').length, icon: CheckCircleIcon, color: 'from-green-500/20 to-green-600/20' },
        { title: 'Pending', value: tasks.filter(t => t.assignedTo?._id === user?._id && t.status === 'Pending').length, icon: ClockIcon, color: 'from-orange-500/20 to-orange-600/20' },
        { title: 'Projects', value: projects.filter(p => p.assignedEmployees?.includes(user?._id)).length, icon: FolderIcon, color: 'from-purple-500/20 to-purple-600/20' },
      ];

  if (loading) return <Loader fullPage />;

  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8 pt-4">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isAdmin && 'Company-wide overview and management'}
              {isManager && 'Manage your team and projects'}
              {isEmployee && 'Your personal workspace'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, i) => <StatsCard key={i} {...stat} />)}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link to="/projects" className="glass-card-hover rounded-2xl p-4 text-center">
              <PlusIcon className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-white text-sm font-medium">New Project</p>
            </Link>
            <Link to="/tasks" className="glass-card-hover rounded-2xl p-4 text-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-white text-sm font-medium">New Task</p>
            </Link>
            <Link to="/employees" className="glass-card-hover rounded-2xl p-4 text-center">
              <UserPlusIcon className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Add Employee</p>
            </Link>
            <Link to="/meetings" className="glass-card-hover rounded-2xl p-4 text-center">
              <CalendarIcon className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-white text-sm font-medium">Schedule Meeting</p>
            </Link>
          </div>

          {/* Activities & Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
              <div className="space-y-2">
                {projects.slice(0, 3).map((p, i) => (
                  <ActivityItem
                    key={i}
                    title={`Project: ${p.title}`}
                    subtitle={`Status: ${p.status}`}
                    time={new Date(p.createdAt).toLocaleDateString()}
                    icon={FolderIcon}
                  />
                ))}
                {tasks.slice(0, 3).map((t, i) => (
                  <ActivityItem
                    key={i}
                    title={`Task: ${t.title}`}
                    subtitle={`Status: ${t.status}`}
                    time={new Date(t.createdAt).toLocaleDateString()}
                    icon={ClipboardDocumentListIcon}
                  />
                ))}
                {projects.length === 0 && tasks.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-6">No recent activity</p>
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {isAdmin ? 'Company Reports' : isManager ? 'Team Reports' : 'My Reports'}
              </h3>
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">No reports yet</p>
                {isEmployee && (
                  <Link to="/reports" className="text-primary text-sm hover:text-secondary mt-2 inline-block">
                    Submit Daily Report →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
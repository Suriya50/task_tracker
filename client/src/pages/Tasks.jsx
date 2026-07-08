import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, MagnifyingGlassIcon, UserIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getTasks, createTask, updateTask, deleteTask } from '../redux/slices/taskSlice';
import { getProjects } from '../redux/slices/projectSlice';
import { getUsers } from '../redux/slices/userSlice';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';

const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks = [], loading } = useSelector((state) => state.tasks);
  const { projects = [] } = useSelector((state) => state.projects);
  const { users = [] } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Pending',
    deadline: '',
  });

  useEffect(() => {
    dispatch(getTasks());
    dispatch(getProjects());
    dispatch(getUsers());
  }, [dispatch]);

  const taskList = Array.isArray(tasks) ? tasks : [];
  const projectList = Array.isArray(projects) ? projects : [];
  const userList = Array.isArray(users) ? users : [];

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createTask(newTask));
    if (createTask.fulfilled.match(result)) {
      toast.success('Task created!');
      setShowModal(false);
      setNewTask({ title: '', description: '', project: '', assignedTo: '', priority: 'Medium', status: 'Pending', deadline: '' });
    }
  };

  const handleStatusChange = async (id, status) => {
    const result = await dispatch(updateTask({ id, taskData: { status } }));
    if (updateTask.fulfilled.match(result)) toast.success('Status updated');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete task?')) {
      const result = await dispatch(deleteTask(id));
      if (deleteTask.fulfilled.match(result)) toast.success('Task deleted');
    }
  };

  const filteredTasks = taskList.filter(t => t.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const getPriorityColor = (p) => ({ High: 'text-red-500 bg-red-500/10', Medium: 'text-yellow-500 bg-yellow-500/10', Low: 'text-green-500 bg-green-500/10' }[p] || 'text-gray-500 bg-white/10');

  const columns = ['Pending', 'In Progress', 'Completed'];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-darkBg"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>;

  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Tasks</h1>
              <p className="text-gray-400 text-sm">Manage tasks across projects</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary-sm flex items-center gap-2">
              <PlusIcon className="w-5 h-5" /> New Task
            </button>
          </div>

          <div className="relative mb-6">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass-with-icon max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter(t => t.status === col);
              return (
                <div key={col} className="kanban-column">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-white">{col}</h3>
                    <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">{colTasks.length}</span>
                  </div>
                  <div className="space-y-3">
                    {colTasks.map((task) => (
                      <div key={task._id} className="kanban-card">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium text-white">{task.title}</h4>
                          <button onClick={() => handleDelete(task._id)} className="text-gray-500 hover:text-red-400">
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                          <span className="text-xs text-gray-400">
                            {task.assignedTo?.name || 'Unassigned'}
                          </span>
                        </div>
                        {task.deadline && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>{new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex gap-1 mt-2">
                          {columns.filter(s => s !== col).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(task._id, status)}
                              className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-400"
                            >
                              → {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No tasks</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Create Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-glass"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows="3"
                  className="input-glass"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project</label>
                <select
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="input-glass"
                  required
                >
                  <option value="">Select Project</option>
                  {projectList.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Assign To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="input-glass"
                >
                  <option value="">Unassigned</option>
                  {userList.filter(u => u.role === 'Employee' || u.role === 'Manager').map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="input-glass"
                >
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="input-glass"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
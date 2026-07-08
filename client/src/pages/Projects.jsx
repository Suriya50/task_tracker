import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CalendarIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getProjects, createProject, updateProject, deleteProject } from '../redux/slices/projectSlice';
import { getUsers } from '../redux/slices/userSlice';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';

const Projects = () => {
  const dispatch = useDispatch();
  const { projects = [], loading } = useSelector((state) => state.projects);
  const { users = [] } = useSelector((state) => state.users);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Active',
    deadline: '',
    manager: '',
    assignedEmployees: [],
  });

  useEffect(() => {
    dispatch(getProjects());
    dispatch(getUsers());
  }, [dispatch]);

  const projectList = Array.isArray(projects) ? projects : [];
  const userList = Array.isArray(users) ? users : [];

  // Filter employees (for assignment)
  const employees = userList.filter(u => u.role === 'Employee');
  // Filter managers (for manager selection)
  const managers = userList.filter(u => u.role === 'Manager');

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createProject(newProject));
    if (createProject.fulfilled.match(result)) {
      toast.success('Project created successfully! 🎉');
      setShowModal(false);
      resetForm();
      dispatch(getProjects());
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProject({
      id: editingProject._id,
      projectData: newProject
    }));
    if (updateProject.fulfilled.match(result)) {
      toast.success('Project updated successfully! ✅');
      setShowModal(false);
      setEditingProject(null);
      resetForm();
      dispatch(getProjects());
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const result = await dispatch(deleteProject(id));
      if (deleteProject.fulfilled.match(result)) {
        toast.success('Project deleted');
        dispatch(getProjects());
      }
    }
  };

  const resetForm = () => {
    setNewProject({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Active',
      deadline: '',
      manager: '',
      assignedEmployees: [],
    });
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setNewProject({
      title: project.title || '',
      description: project.description || '',
      priority: project.priority || 'Medium',
      status: project.status || 'Active',
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      manager: project.manager?._id || '',
      assignedEmployees: project.assignedEmployees?.map(e => e._id) || [],
    });
    setShowModal(true);
  };

  const toggleEmployee = (empId) => {
    setNewProject(prev => ({
      ...prev,
      assignedEmployees: prev.assignedEmployees.includes(empId)
        ? prev.assignedEmployees.filter(id => id !== empId)
        : [...prev.assignedEmployees, empId],
    }));
  };

  const filteredProjects = projectList.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority) => ({
    High: 'text-red-500 bg-red-500/10 border-red-500/20',
    Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    Low: 'text-green-500 bg-green-500/10 border-green-500/20',
  }[priority] || 'text-gray-500 bg-white/10');

  const getStatusColor = (status) => ({
    Active: 'text-green-500 bg-green-500/10 border-green-500/20',
    OnHold: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    Completed: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  }[status] || 'text-gray-500 bg-white/10');

  if (loading) {
    return (
      <div className="flex min-h-screen bg-darkBg">
        <Sidebar />
        <div className="flex-1 ml-0 lg:ml-64">
          <Navbar />
          <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Projects</h1>
              <p className="text-gray-400 text-sm mt-1">Manage all company projects</p>
            </div>
            <button
              onClick={() => {
                setEditingProject(null);
                resetForm();
                setShowModal(true);
              }}
              className="btn-primary-sm flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <PlusIcon className="w-5 h-5" /> New Project
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass-with-icon max-w-md"
            />
          </div>

          {/* Project Grid */}
          {filteredProjects.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <FolderIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
              <p className="text-gray-400">Create your first project to get started</p>
              <button
                onClick={() => {
                  setEditingProject(null);
                  resetForm();
                  setShowModal(true);
                }}
                className="btn-primary-sm mt-4 inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" /> Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project) => (
                <div key={project._id} className="glass-card-hover rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">{project.title}</h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-gray-500 hover:text-blue-400 transition-colors p-1 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {user?.role === 'Admin' && (
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1 rounded"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{project.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full border ${getPriorityColor(project.priority)}`}>
                      {project.priority}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{(project.assignedEmployees || []).length} assigned</span>
                    </div>
                  </div>
                  {project.manager && (
                    <div className="text-xs text-gray-500 mt-2">
                      Manager: {project.manager.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProject(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingProject ? handleUpdate : handleCreate} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project Title *</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="input-glass"
                  required
                  placeholder="Enter project title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows="3"
                  className="input-glass"
                  placeholder="Enter project description"
                />
              </div>

              {/* Priority & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                    className="input-glass"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    className="input-glass"
                  >
                    <option value="Active">Active</option>
                    <option value="OnHold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  className="input-glass"
                />
              </div>

              {/* Manager Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Manager</label>
                <select
                  value={newProject.manager}
                  onChange={(e) => setNewProject({ ...newProject, manager: e.target.value })}
                  className="input-glass"
                >
                  <option value="">Select Manager</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Assign Employees */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Assign Employees</label>
                <div className="flex flex-wrap gap-2 p-2 border border-white/10 rounded-xl bg-white/5 max-h-32 overflow-y-auto">
                  {employees.length === 0 ? (
                    <span className="text-gray-500 text-sm">No employees available</span>
                  ) : (
                    employees.map((emp) => (
                      <label
                        key={emp._id}
                        className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded transition-all ${
                          newProject.assignedEmployees.includes(emp._id)
                            ? 'bg-primary/20 text-primary'
                            : 'text-white hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newProject.assignedEmployees.includes(emp._id)}
                          onChange={() => toggleEmployee(emp._id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                        />
                        {emp.name}
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {newProject.assignedEmployees.length} employee(s) selected
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
const Project = require('../models/Project');
const Notification = require('../models/Notification');

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ company: req.user.company._id })
      .populate('createdBy', 'name email')
      .populate('manager', 'name email')
      .populate('assignedEmployees', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('manager', 'name email')
      .populate('assignedEmployees', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (String(project.company) !== String(req.user.company._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    // ─── VALIDATE TITLE ───
    if (!req.body.title || req.body.title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    const projectData = {
      title: req.body.title.trim(),
      description: req.body.description || '',
      priority: req.body.priority || 'Medium',
      status: req.body.status || 'Active',
      deadline: req.body.deadline || null,
      manager: req.body.manager || null,
      assignedEmployees: Array.isArray(req.body.assignedEmployees) ? req.body.assignedEmployees : [],
      company: req.user.company._id,
      createdBy: req.user.id,
    };

    const project = await Project.create(projectData);

    // ─── NOTIFICATIONS ───
    if (project.assignedEmployees.length > 0) {
      for (const empId of project.assignedEmployees) {
        await Notification.create({
          recipient: empId,
          type: 'task',
          title: 'New Project Assigned',
          message: `You have been assigned to project: ${project.title}`,
          company: req.user.company._id,
          relatedId: project._id,
          typeModel: 'Project',
        });
      }
    }
    if (project.manager) {
      await Notification.create({
        recipient: project.manager,
        type: 'task',
        title: 'New Project Assigned',
        message: `You are the manager for project: ${project.title}`,
        company: req.user.company._id,
        relatedId: project._id,
        typeModel: 'Project',
      });
    }

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('manager', 'name email')
      .populate('assignedEmployees', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('❌ createProject error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email')
      .populate('manager', 'name email')
      .populate('assignedEmployees', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await project.remove();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
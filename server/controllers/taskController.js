const Task = require('../models/Task');
const Notification = require('../models/Notification');

// ─── GET ALL TASKS ───
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ company: req.user.company._id })
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// ─── CREATE TASK ───
exports.createTask = async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      company: req.user.company._id,
      createdBy: req.user.id,
    };

    const task = await Task.create(taskData);

    // Notify assigned user
    if (task.assignedTo) {
      await Notification.create({
        recipient: task.assignedTo,
        type: 'task',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        company: req.user.company._id,
        relatedId: task._id,
        typeModel: 'Task',
      });
    }

    const populated = await Task.findById(task._id)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE TASK ───
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE TASK ───
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    await task.remove();
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
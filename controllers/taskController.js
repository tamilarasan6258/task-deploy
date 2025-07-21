const Task = require('../models/taskModel');

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json({ msg: 'Task created successfully', task });
  } 
  catch (err) {
    console.error('Task creation error:', err.message);
    res.status(500).json({
      status: 'error',
      msg: 'Server error while creating task'
    });
  }
};

// GET ALL TASKS (optionally filtered by project ID)
exports.getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }
    const tasks = await Task.find(filter).populate('project', 'projectName');
    res.json(tasks);
  } 
  catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({
      status: 'error',
      msg: 'Server error while retrieving tasks'
    });
  }
};

// GET A SINGLE TASK BY ID
exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json(task);
  } 
  catch (err) {
    console.error('Error fetching task:', err.message);
    res.status(500).json({
      status: 'error',
      msg: 'Server error while fetching task'
    });
  }
};

// UPDATE A TASK BY ID
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    // Find the existing task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    const oldStatus = task.status;
    const newStatus = updates.status;

    // Log to confirm
    console.log(`Old Status: ${oldStatus}, New Status: ${newStatus}`);

    //  Handle completedAt update
    if (oldStatus !== newStatus) {
      if (newStatus === 'done') {
        task.completedAt = new Date();
      } else if (oldStatus === 'done' && newStatus !== 'done') {
        task.completedAt = null;
      }
    }

    //  Update other fields
    for (const key in updates) {
      if (key !== 'completedAt') {
        task[key] = updates[key];
      }
    }

    const updatedTask = await task.save();

    res.json({ msg: 'Task updated successfully', task: updatedTask });

  } catch (err) {
    console.error('Task update error:', err.message);
    res.status(500).json({ status: 'error', msg: 'Failed to update task' });
  }
};


// DELETE A TASK BY ID
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const deleted = await Task.findByIdAndDelete(taskId);
    if (!deleted) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json({ msg: 'Task deleted' });
  } 
  catch (err) {
    console.error('Task delete error:', err.message);
    res.status(500).json({
      status: 'error',
      msg: 'Failed to delete task'
    });
  }
};

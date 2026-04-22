const express = require('express');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find()
        .populate('lead', 'name email')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(),
    ]);

    res.json({ tasks, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, lead, assignedTo, dueDate, status } = req.body;

    if (!title || !lead || !assignedTo) {
      return res.status(400).json({ message: 'Title, lead, and assignedTo are required' });
    }

    const task = await Task.create({
      title,
      description,
      lead,
      assignedTo,
      dueDate,
      status,
      createdBy: req.user._id,
    });

    await task.populate('lead', 'name email');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/tasks/:id — full update (any authenticated user can update most fields)
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // AUTHORIZATION: Only the assigned user can update the status field
    if (req.body.status && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the assigned user can update task status',
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('lead', 'name email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/tasks/:id/status — dedicated status update endpoint
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // AUTHORIZATION: Only assigned user can update status
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the assigned user can update task status',
      });
    }

    task.status = status;
    await task.save();

    await task.populate('lead', 'name email');
    await task.populate('assignedTo', 'name email');

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

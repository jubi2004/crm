const express = require('express');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalLeads,
      qualifiedLeads,
      tasksDueToday,
      completedTasks,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'Qualified' }),
      Task.countDocuments({ dueDate: { $gte: today, $lt: tomorrow }, status: { $ne: 'Completed' } }),
      Task.countDocuments({ status: 'Completed' }),
    ]);

    res.json({
      totalLeads,
      qualifiedLeads,
      tasksDueToday,
      completedTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

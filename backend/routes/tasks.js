const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { taskTitle, taskType, startDate, endDate, taskDescription, assignedTo } = req.body;

  const task = new Task({
    taskTitle,
    taskType,
    startDate,
    endDate,
    taskDescription,
    assignedTo,
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
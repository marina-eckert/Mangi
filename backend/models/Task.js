const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskTitle: {
    type: String,
    required: true,
  },
  taskType: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  taskDescription: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['To Do', 'In Progress', 'Done'],
    default: 'To Do',
  },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;
// project.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({}, { timestamps: true });

TaskSchema.add({
  title: {
    type: String,
    required: true
  },
  description: String,
  priority: String,
  status: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.startDate;
      },
      message: 'End date must be greater than or equal to start date.'
    }
  },
  progress: Number,
  subtasks: [TaskSchema],
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }]
});

const projectSchema = new Schema({
      title: {
          type: String,
          required: true
      },
      description: {
          type: String,
          required: false
      },
      tasks: [TaskSchema],
      startDate: {
          type: Date,
          required: true
      },
      endDate: {
          type: Date,
          required: false
      }
  }, {timestamps: true}
);

module.exports = {
    Project: mongoose.model('Project', projectSchema),
    Task: TaskSchema
}
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
      type: String,
      required: true
    },
    username: {
        type: String,
        required: true
      },
    hashedPassword: {
      type: String,
      required: true
    },
    projects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false
    }],
    assignedTasks: [{
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: false
    }]
  }, {
    timestamps: true
  });

  module.exports = mongoose.model('User', userSchema);
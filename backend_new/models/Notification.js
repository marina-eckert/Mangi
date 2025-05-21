// notification.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    message: {
        type: String,
        required: false
    }, 
    target: {
        type: String,
        required: false
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: false
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: false
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
    }, {timestamps: true}
)

module.exports = mongoose.model('Notification', notificationSchema);
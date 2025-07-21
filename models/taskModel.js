const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true,
  },
  taskDesc: {
    type: String,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],      //enum - enumeration(limits the value of a field to a predefined set of values)
    default: 'medium',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['backlog', 'to-do', 'in-progress', 'done'],
    default: 'backlog',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  completedAt: {
  type: Date,
  default: null
}

  
},{ timestamps: true } );

module.exports = mongoose.model('Task', TaskSchema);

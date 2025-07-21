const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
    },
    projectDesc: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Project', ProjectSchema);

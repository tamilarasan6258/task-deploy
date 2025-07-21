const Project = require('../models/projectModel');

//CREATE PROJECT
exports.createProject = async (req, res) => {
  const { projectName, projectDesc, dueDate } = req.body;
  const userId = req.user.userId; // Use authenticated user ID from middleware

  try {
    const newProject = new Project({
      projectName,
      projectDesc,
      dueDate,
      user: userId,
    });

    await newProject.save();

    res.status(201).json({
      msg: 'Project created successfully',
      project: newProject
    });
  } 
  catch (err) 
  {
    console.error('Create Project Error:', err.message);
    res.status(500).json({ msg: 'Server error while creating project' });
  }
};

//GET ALL PROJECTS BY USER ID
exports.getProjectsByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const projects = await Project.find({ user: userId }).sort({ dueDate: 1 });
    res.json(projects);
  } 
  catch (err) {
    console.error('Fetch Projects Error:', err.message);
    res.status(500).json({ msg: 'Server error while fetching projects' });
  }
};


//GET A SINGLE PROJECT BY PROJECT ID
exports.getProjectById = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId).populate('user', 'uname email');
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    res.json(project);
  } 
  catch (err) {
    console.error('Get Project Error:', err.message);
    res.status(500).json({ msg: 'Server error while retrieving project' });
  }
};

//UPDATE A PROJECT BY ID
exports.updateProject = async (req, res) => {
  const projectId = req.params.projectId;
  const { projectName, projectDesc, dueDate } = req.body;

  try {
    const updated = await Project.findByIdAndUpdate(
      projectId,
      { projectName, projectDesc, dueDate },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    res.json({
      msg: 'Project updated successfully',
      project: updated
    });
  } catch (err) {
    console.error('Update Project Error:', err.message);
    res.status(500).json({ msg: 'Server error while updating project' });
  }
};

//DELETE A PROJECT BY ID
exports.deleteProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const deleted = await Project.findByIdAndDelete(projectId);
    if (!deleted) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    res.json({ msg: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete Project Error:', err.message);
    res.status(500).json({ msg: 'Server error while deleting project' });
  }
};

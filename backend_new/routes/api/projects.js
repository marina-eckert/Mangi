const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = mongoose.model('Project');
const User = mongoose.model('User');
const Notification = mongoose.model('Notification');
const { requireUser } = require('../../config/passport');
const {
  userOnProject,
  taskProtector,
  stringifyCompare,
  blockingTaskCheck,
  arrayDiff
} = require('../../config/util');
const { Task } = require('../../models/Project');

function validateSubtasks(subtasks, project) {
  if (!subtasks) return true;
  for (const subtask of subtasks) {
    if (!subtask.title || !subtask.startDate || !subtask.endDate) return false;
    if (subtask.blockingTasks?.length) {
      if (!blockingTaskCheck(subtask, project)) return false;
    }
    if (!validateSubtasks(subtask.subtasks, project)) return false;
  }
  return true;
}

router.get('/', requireUser, async (req, res) => {
  try {

    const projects = await Project.find({
    });

    const projectsData = projects.map(project => ({
      _id: project._id,
      title: project.title,
      description: project.description,
      adminId: project.adminId,
      startDate: project.startDate,
      endDate: project.endDate,
      tasks: project.tasks,
      collaborators: project.collaborators
    }));

    return res.json(projectsData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a project
router.get('/:projectid', requireUser, async (req, res) => {
  const projectId = req.params.projectid;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "No Project Found" });
    }

    const projectData = {
      _id: project._id,
      title: project.title,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      tasks: project.tasks
    };

    return res.json({ [project._id]: projectData });
  } catch (error) {
    return res.status(404).json({ message: "Project not found" });
  }
});

// Get all tasks for a project
router.get('/:projectId/tasks', requireUser, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    return res.json(project.tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create a new task
router.post('/:projectId/tasks', requireUser, async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create new task subdocument inside project.tasks
    const task = project.tasks.create(req.body);

    // Push the new task to the project's tasks array
    project.tasks.push(task);
    await project.save();

    // Return the created task with projectId
    return res.status(201).json({ ...task.toObject(), projectId: project._id });

  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update a task
router.patch('/:projectId/tasks/:taskId', requireUser, async (req, res) => {
  const { projectId, taskId } = req.params;
  try {
    const project = await Project.findById(projectId);
    console.log('project: ', project);
    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!validateSubtasks(req.body.subtasks, project)) {
      return res.status(400).json({ message: "Invalid subtasks" });
    }    
    Object.assign(task, req.body);
    await project.save();

    return res.json({ ...task.toObject(), projectId });
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Delete a task
router.delete('/:projectId/tasks/:taskId', requireUser, async (req, res) => {
  const { projectId, taskId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project || !userOnProject(project, req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await User.updateMany({ assignedTasks: taskId }, { $pull: { assignedTasks: taskId } });

    task.remove();
    await project.save();

    return res.json({ message: "Deletion complete" });
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Create a project
router.post('/', requireUser, async (req, res) => {
  const { title, description, adminId, collaborators = [], startDate, endDate } = req.body;

  const newProject = new Project({
    title,
    description,
    adminId,
    collaborators: [...collaborators, adminId],
    startDate,
    endDate,
    tasks: []
  });

  try {
    const savedProject = await newProject.save();

    await User.updateMany(
      { _id: { $in: savedProject.collaborators } },
      { $push: { projects: savedProject._id } }
    );

    return res.json(savedProject);
  } catch (error) {
    return res.status(500).json({ message: "Error creating project", error });
  }
});

// Update a project
router.patch('/:projectId', requireUser, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    Object.assign(project, req.body);
    const updated = await project.save();
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Error updating project", error });
  }
});

// Add a subtask to a task
router.post('/:projectId/tasks/:taskId/subtasks', requireUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || !userOnProject(project, req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const parentTask = project.tasks.id(req.params.taskId);
    if (!parentTask) return res.status(404).json({ message: "Task not found" });

    parentTask.subtasks.push(req.body);
    await project.save();

    return res.status(201).json(parentTask.subtasks[parentTask.subtasks.length - 1]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add subtask", error: err });
  }
});

// Update a subtask
router.patch('/:projectId/tasks/:taskId/subtasks/:subtaskId', requireUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || !userOnProject(project, req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = project.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    Object.assign(subtask, req.body);
    await project.save();

    return res.json(subtask);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update subtask", error: err });
  }
});

// Delete a subtask
router.delete('/:projectId/tasks/:taskId/subtasks/:subtaskId', requireUser, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || !userOnProject(project, req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = project.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    subtask.remove();
    await project.save();

    return res.json({ message: "Subtask deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete subtask", error: err });
  }
});

module.exports = router;
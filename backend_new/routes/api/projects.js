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

// Get a project
router.get('/:projectid', requireUser, async (req, res) => {
  const projectId = req.params.projectid;

  try {
    const project = await Project.findById(projectId);
    if (!project || !userOnProject(project, req.user._id)) {
      return res.status(404).json({ message: "No Project Found" });
    }

    const projectData = {
      _id: project._id,
      title: project.title,
      description: project.description,
      adminId: project.adminId,
      startDate: project.startDate,
      endDate: project.endDate,
      tasks: project.tasks,
      collaborators: project.collaborators
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
    if (!project || !userOnProject(project, req.user._id)) {
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
  const { assignee, blockingTasks } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project || !userOnProject(project, req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (assignee) {
      const user = await User.findById(assignee);
      if (!user || !userOnProject(project, assignee) || !user.projects.includes(projectId)) {
        return res.status(403).json({ message: "Invalid assignee" });
      }
    }

    const task = project.tasks.create(req.body); // safer subdoc creation

    if (blockingTasks?.length) {
      if (!blockingTaskCheck(task, project)) {
        return res.status(400).json({ message: "Invalid blocking tasks" });
      }
    }
    if (!validateSubtasks(req.body.subtasks, project)) {
      return res.status(400).json({ message: "Invalid subtasks" });
    }
    
    project.tasks.push(task);
    await project.save();
    
    if (assignee) {
      await User.findByIdAndUpdate(assignee, { $push: { assignedTasks: task._id } });
    }
    
    return res.status(201).json({ ...task.toObject(), projectId: project._id });
        
  } catch (error) {
    return res.status(500).json(error);
  }
});

// Update a task
router.patch('/:projectId/tasks/:taskId', requireUser, async (req, res) => {
  const { projectId, taskId } = req.params;
  const { assignee, blockingTasks } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project || !userOnProject(project, req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const task = project.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const priorAssignee = task.assignee?.toString();

    if (assignee !== undefined && assignee !== priorAssignee) {
      if (priorAssignee) {
        await User.findByIdAndUpdate(priorAssignee, { $pull: { assignedTasks: taskId } });
      }

      if (assignee) {
        if (!userOnProject(project, assignee)) {
          return res.status(403).json({ message: "Invalid new assignee" });
        }
        await User.findByIdAndUpdate(assignee, { $addToSet: { assignedTasks: taskId } });
        task.assignee = assignee;
      } else {
        task.assignee = null;
      }
    }

    if (blockingTasks !== undefined) {
      const priorBlocking = task.blockingTasks.map(id => id.toString());
      const { added } = arrayDiff(priorBlocking, blockingTasks);

      if (added.length && !blockingTaskCheck({ ...task.toObject(), blockingTasks }, project)) {
        return res.status(400).json({ message: "Invalid blocking tasks" });
      }
    }
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
  const incomingCollaborators = req.body.collaborators?.sort();

  try {
    const project = await Project.findById(projectId);
    if (!project || !userOnProject(project, req.user._id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (incomingCollaborators) {
      const prior = project.collaborators.map(c => c.toString()).sort();
      if (!stringifyCompare(prior, incomingCollaborators)) {
        await User.updateMany(
          { _id: { $in: prior.filter(c => !incomingCollaborators.includes(c)) } },
          { $pull: { projects: projectId } }
        );

        await User.updateMany(
          { _id: { $in: incomingCollaborators.filter(c => !prior.includes(c)) } },
          { $addToSet: { projects: projectId } }
        );
      }
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
// routes/projects.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { projectTitle, projectType, startDate, endDate, projectDescription } = req.body;

  if (!projectTitle || !projectType || !startDate || !endDate || !projectDescription) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  try {
    const newProject = new Project({
      name: projectTitle,
      type: projectType,
      startDate,
      endDate,
      description: projectDescription,
      user: req.user
    });

    await newProject.save();
    res.status(201).json({ msg: 'Project created', project: newProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

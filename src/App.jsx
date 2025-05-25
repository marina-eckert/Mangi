import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Create_project from './pages/Create_project';
import Dashboard from './pages/Dashboard';
import Create_task from './pages/Create_task';
import Help from './pages/Help';
import Inbox from './pages/Inbox';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Teams from './pages/Teams';
import Sign_in from './pages/Sign_in';
import Sign_up from './pages/Sign_up';
import ProjectsTree from './pages/ProjectsTree';
import Temp from './pages/temp';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectDetails from './pages/ProjectDetails';

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/sign_in" replace />} />
          <Route path="/header" element={<Header />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create_project" element={<Create_project />} />
          <Route path="/create_task" element={<Create_task />} />
          <Route path="/help" element={<Help />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/teams" element={<Teams />} /> 
          <Route path="/tree" element={<ProjectsTree />} />
          <Route path="/temp" element={<Temp />} />
          <Route path="/sign_in" element={<Sign_in />} /> 
          <Route path="/sign_up" element={<Sign_up />} />
        </Routes>
    </Router>
  )
}

export default App;

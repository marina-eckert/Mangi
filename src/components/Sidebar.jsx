import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <Link to="/" className="logo">Mangi</Link>
      <nav>
        <Link to="/dashboard">🏠 Home</Link>
        <Link to="/projects">🗂 My Projects</Link>
        <Link to="/tasks">✅ My Tasks</Link>
        <Link to="/inbox">✉️ Inbox</Link>
        <Link to="/teams">👥 Teams</Link>
        <Link to="/settings">⚙️ Settings</Link>
      </nav>
    </div>
  );
}

export default Sidebar;


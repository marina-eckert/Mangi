import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/style.css';
import avatar1 from '../assets/images/avatar1.jpg'; 
import avatar2 from '../assets/images/avatar2.jpg';
import avatar3 from '../assets/images/avatar3.jpg';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function Dashboard() {
  const [projects, setProjects] = useState([
    'Project 1',
    'Project 2',
    'Project 3',
  ]);
  const [tasks, setTasks] = useState([
    { name: 'Task A', status: 'In Progress' },
    { name: 'Task B', status: 'In Progress' },
  ]);

  return (
    <div className="dashboard">
      <Header />
      <Sidebar />

      {/* Main Content */}
      <div className="content">
        {/* Projects Section */}
        <div className="section">
          <h2 className="section-title">Projects</h2>
          <div className="projects">
            {projects.map((project, index) => (
              <div key={index} className="card">
                {project}
                <div className="more">⋮</div>
              </div>
            ))}
            <Link to="/create_project">
              <button
                className="button"
                style={{ fontSize: '1.5rem', display: 'block', margin: '1rem auto' }}
              >
                ＋
              </button>
            </Link>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="section">
          <h2 className="section-title">Tasks</h2>
          <div className="tasks">
            <div className="progress">In Progress</div>
            {tasks.map((task, index) => (
              <div key={index} className="card">
                {task.name}
                <div className="more">⋮</div>
              </div>
            ))}
            <Link to="/create_task">
              <button
                className="button"
                style={{ fontSize: '1.5rem', display: 'block', margin: '1rem auto' }}
              >
                ＋
              </button>
            </Link>
          </div>
        </div>

        {/* Invite Section */}
        <div className="invite">
          <div className="avatars">
            <img src={avatar1} alt="Avatar 1" />
            <img src={avatar2} alt="Avatar 2" />
            <img src={avatar3} alt="Avatar 3" />
          </div>
          <div>Invite your teammates to start collaborating</div>
          <button className="button">Invite</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

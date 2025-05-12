import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';
import { useNavigate } from 'react-router-dom';

function Projects() {
  const navigate = useNavigate();

  const projectList = ['Project Alpha', 'Project Beta', 'Project Gamma'];

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="content">
        <div className="section">
          <h2 className="section-title">My Projects</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {projectList.map((project, index) => (
              <div key={index} className="card">
                {project}
                <div className="more">⋮</div>
              </div>
            ))}
            <button
              className="button"
              style={{ fontSize: '1.5rem', margin: '1rem auto' }}
              onClick={() => navigate('/create_project')}
            >
              ＋ New Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;

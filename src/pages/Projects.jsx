import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';
import { useNavigate } from 'react-router-dom';

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.msg || 'Failed to fetch projects');

        setProjects(data);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="content">
        <div className="section">
          <h2 className="section-title">My Projects</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {projects.map((project, index) => (
              <div key={index} className="card">
                {project.name}
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
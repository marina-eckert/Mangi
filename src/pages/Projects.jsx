// src/pages/Projects.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdAccountTree } from 'react-icons/md';
import '../assets/css/style.css';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      try {
        // 1) fetch projects
        const res = await fetch('http://localhost:3000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();

        // 2) fetch tasks for each project
        const withTasks = await Promise.all(
          data.map(async (p) => {
            const tRes = await fetch(
              `http://localhost:3000/api/projects/${p._id}/tasks`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const tasks = tRes.ok ? await tRes.json() : [];
            return { ...p, tasks };
          })
        );

        setProjects(withTasks);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    })();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '40px 60px', background: '#f3f4f6' }}>
        <h2 style={{ paddingTop: 40, 
        paddingLeft:40,
          //add 
          marginBottom: 30, paddingLeft:90, color: '#0f1a43', fontSize: 35, fontWeight: 'bold' }}>
          My Projects
        </h2>

        <div style={{margin: 120, paddingLeft:80, display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {projects.map(project => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              style={{
                position: 'relative',
                minWidth: 250,
                minHeight: 200,
                background: '#fff',
                borderRadius: 32,
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              {/* project title */}
              <h3 style={{ margin: 10, marginBottom: '0.5rem', color: '#0f1a43', fontSize: 20 }}>
                {project.title}
              </h3>

              {/* task list with MdAccountTree icon */}
              <ul style={{ margin: 0, paddingTop: 10, padding: 25, listStyle: 'none', color: '#4b5563', fontSize: 14 }}>
                {project.tasks.slice(0, 3).map(task => (
                  <li key={task._id || task.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <MdAccountTree style={{ marginRight: 6, color: '#6b7280' }} />
                    {task.title || task.taskTitle}
                  </li>
                ))}
                {project.tasks.length > 3 && (
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <MdAccountTree style={{ marginRight: 6, color: '#6b7280' }} />
                    …
                  </li>
                )}
                {project.tasks.length < 1 && (
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    {/* <MdAccountTree style={{ marginRight: 6, color: '#6b7280' }} /> */}
                    No Tasks yet...
                  </li>
                )}
              </ul>

              {/* “more” ⋮ icon */}
              <div style={{ position: 'absolute', top: 18, right: 15, color: '#6b7280', fontSize: 23 }}>
                ⋮
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* floating “New Project” button */}
      <button
        onClick={() => navigate('/create_project')}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          background: '#1e293b',
          
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontSize: 32,
          lineHeight: 1,
          cursor: 'pointer'
        }}
      >
        ＋
      </button>
    </div>
  );
}

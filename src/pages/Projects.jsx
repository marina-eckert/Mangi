
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { MdAccountTree } from 'react-icons/md';
import { FiTrash2 } from 'react-icons/fi';       // ← new
import '../assets/css/style.css';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:3000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();

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

  // ← new: call DELETE and update state
  const deleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://localhost:3000/api/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!res.ok) throw new Error('Failed to delete project');
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '40px 60px', background: '#f3f4f6' }}>
        <h2
          style={{
            paddingTop: 40,
            marginBottom: 30,
            paddingLeft: 90,
            color: '#0f1a43',
            fontSize: 35,
            fontWeight: 'bold'
          }}
        >
          My Projects
        </h2>

        <div
          style={{
            margin: 120,
            paddingLeft: 80,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
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
              {/* Delete button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  deleteProject(project._id);
                }}
                style={{
                  position: 'absolute',
                  top: 22,
                  right: 12,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#e11d48'
                }}
              >
                <FiTrash2 size={20} />
              </button>

              {/* project title */}
              <h3
                style={{
                  margin: 10,
                  marginBottom: '0.5rem',
                  color: '#0f1a43',
                  fontSize: 20
                }}
              >
                {project.title}
              </h3>

              {/* task list */}
              <ul
                style={{
                  margin: 0,
                  paddingTop: 10,
                  padding: 25,
                  listStyle: 'none',
                  color: '#4b5563',
                  fontSize: 14
                }}
              >
                {project.tasks.slice(0, 3).map(task => (
                  <li
                    key={task._id || task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 4
                    }}
                  >
                    <MdAccountTree
                      style={{ marginRight: 6, color: '#6b7280' }}
                    />
                    {task.title || task.taskTitle}
                  </li>
                ))}
                {project.tasks.length > 3 && (
                  <li
                    style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MdAccountTree
                      style={{ marginRight: 6, color: '#6b7280' }}
                    />
                    …
                  </li>
                )}
                {project.tasks.length < 1 && (
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    No Tasks yet...
                  </li>
                )}
              </ul>

              {/* “more” ⋮ icon */}
              {/* <div
                style={{
                  position: 'absolute',
                  top: 18,
                  right: 45,
                  color: '#6b7280',
                  fontSize: 23
                }}
              >
                ⋮
              </div> */}
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

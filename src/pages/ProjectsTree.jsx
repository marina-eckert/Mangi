import React, { useEffect, useState } from 'react';
import './ProjectsTree.css';
import Sidebar from '../components/Sidebar';

export default function ProjectsTree() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:3000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load projects');
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    })();
  }, []);

  return (
    <div className="projects-tree-page">
      <Sidebar />

      <h2
        style={{
          paddingTop: 40,
          marginBottom: 30,
          paddingLeft: 90,
          color: '#0f1a43',
          fontSize: 30,
          fontWeight: 'bold'
        }}
      >
        Projects Tree
      </h2>

      <div className="tree-container" style={{ marginLeft: 80, padding: '40px 60px' }}>
        {projects.map(proj => (
          <div key={proj._id} className="tree-col">
            <div className="node project-node">{proj.title}</div>
            <div className="connector vertical" />

            <div className="children">
              {proj.tasks.map(task => (
                <div key={task._id} className="tree-subcol">
                  <div className="node task-node">{task.title}</div>

                  {task.subtasks?.length > 0 && (
                    <>
                      <div className="connector vertical short" />
                      <div className="connector horizontal" />

                      <div className="grandchildren">
                        {task.subtasks.map(sub => (
                          <div key={sub._id} className="tree-subcol">
                            <div className="node subtask-node">{sub.title}</div>

                            {sub.subtasks?.length > 0 && (
                              <>
                                <div className="connector vertical short" />
                                <div className="connector horizontal" />

                                <div className="greatgrandchildren">
                                  {sub.subtasks.map(sub2 => (
                                    <div key={sub2._id} className="node subsubtask-node">
                                      {sub2.title}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

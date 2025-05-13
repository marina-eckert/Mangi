import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/style.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import avatar1 from '../assets/images/avatar1.jpg'; 
import avatar2 from '../assets/images/avatar2.jpg';
import avatar3 from '../assets/images/avatar3.jpg';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const [projectsResponse, tasksResponse] = await Promise.all([
          fetch('http://localhost:5000/api/projects', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          }),
          fetch('http://localhost:5000/api/tasks', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          }),
        ]);

        if (projectsResponse.ok && tasksResponse.ok) {
          const projectsData = await projectsResponse.json();
          const tasksData = await tasksResponse.json();
          setProjects(projectsData);
          setTasks(tasksData);
        } else {
          setError('Failed to load projects or tasks');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            {loading ? (
              <div>Loading projects...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="card">
                  {project.name}
                  <div className="more">⋮</div>
                </div>
              ))
            )}
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
            {loading ? (
              <div>Loading tasks...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <>
                <div className="progress">In Progress</div>
                {tasks.map((task) => (
                  <div key={task.id} className="card">
                    {task.taskTitle}
                    <div className="more">⋮</div>
                  </div>
                ))}
              </>
            )}
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

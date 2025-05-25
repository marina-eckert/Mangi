import React, { useState, useEffect, useRef } from 'react';
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
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [formData, setFormData] = useState({}); 
  
  // Invite form toggle
  const [inviteVisible, setInviteVisible] = useState(false);
  const inviteInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const projectsResponse = await fetch('http://localhost:5000/api/projects', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!projectsResponse.ok) {
          setError('Failed to load projects');
          setLoading(false);
          return;
        }

        const projectsData = await projectsResponse.json();
        setProjects(projectsData);

        const tasksByProject = [];

        await Promise.all(
          projectsData.map(async (project) => {
            const tasksResponse = await fetch(`http://localhost:5000/api/projects/${project._id}/tasks`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              }
            });

            let tasksData = [];
            if (tasksResponse.ok) {
              tasksData = await tasksResponse.json();
            }

            tasksByProject.push({
              projectId: project._id,
              tasks: tasksData
            });
          })
        );

        setTasks(tasksByProject);

      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Click outside to close invite form
    const handleClickOutside = (e) => {
      if (
        inviteInputRef.current &&
        !inviteInputRef.current.contains(e.target)
      ) {
        setInviteVisible(false);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle showing settings menu dropdown for a card
  const [openMenus, setOpenMenus] = useState({});
  const toggleMenu = (id) => {
    setOpenMenus((prev) => {
      // close others
      const newState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[id] = !prev[id];
      return newState;
    });
  };

  // Handle removing task
  const removeTask = (taskId) => {
    setTasks((prev) => prev.filter(t => t.id !== taskId));
    setOpenMenus({});
  };

  // Render summary badges 
  const renderSettingsSummary = (item) => {
    if (item.type === 'project') {
      const team = item.team || 'Unassigned';
      const date = item.date ? new Date(item.date).toLocaleDateString() : 'TBD';
      return (
        <div className="settings-summary">
          <span>{team}</span>
          <span>{date}</span>
        </div>
      );
    } else {
      const user = item.user || 'Unassigned';
      const status = item.status || 'To Do';
      const proj = item.project || 'None';
      return (
        <div className="settings-summary">
          <span>{user}</span>
          <span>{status}</span>
          <span>{proj}</span>
        </div>
      );
    }
  };

  // Open modal and prepare form data
  const openSettingsModal = (item) => {
    setCurrentCard(item);
    if (item.type === 'project') {
      setFormData({
        name: item.name,
        date: item.date || '',
        team: item.team || '',
      });
    } else {
      setFormData({
        name: item.taskTitle,
        user: item.user || '',
        status: item.status || 'To Do',
        project: item.project || '',
      });
    }
    setModalOpen(true);
    setOpenMenus({});
  };

  // Handle modal form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save changes from modal
  const saveSettings = (e) => {
    e.preventDefault();
    if (!currentCard) return;

    if (currentCard.type === 'project') {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentCard.id
            ? { ...p, name: formData.name, date: formData.date, team: formData.team }
            : p
        )
      );
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === currentCard.id
            ? {
                ...t,
                taskTitle: formData.name,
                user: formData.user,
                status: formData.status,
                project: formData.project,
              }
            : t
        )
      );
    }
    setModalOpen(false);
    setCurrentCard(null);
  };

  // Subtask toggle state for tasks
  const [expandedTasks, setExpandedTasks] = useState({});
  const toggleSubtasks = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  // Handle Invite form submit
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    const email = e.target.elements.email.value.trim();
    if (!email) return alert('Please enter an email');
    alert(`Invitation sent to ${email}`);
    e.target.reset();
    setInviteVisible(false);
  };

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
                <div
                  key={project.id}
                  className="card"
                  data-type="project"
                  data-id={project.id}
                  data-team={project.team || ''}
                  data-date={project.date || ''}
                >
                  <span
                    className="card-title"
                  >
                    {project.title}
                  </span>
                  <div
                    className="more"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(`project-${project.id}`);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    ⋮
                  </div>
                  {openMenus[`project-${project.id}`] && (
                    <div className="card-menu" style={{ display: 'block' }}>
                      <a
                        href="#"
                        className="settings-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          openSettingsModal({ ...project, type: 'project' });
                        }}
                      >
                        Settings
                      </a>
                    </div>
                  )}
                  {renderSettingsSummary({ ...project, type: 'project' })}
                </div>
              ))
            )}
            <Link to="/create_project">
              <button
                className="button"
                style={{ fontSize: '1.5rem', display: 'block', margin: '1rem auto' }}
              >
                ＋ New Project
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
                
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="card"
                    data-type="task"
                    data-id={task.id}
                    data-user={task.user || ''}
                    data-status={task.status || ''}
                    data-project={task.project || ''}
                    style={{ position: 'relative' }}
                  >
                    <span
                      className="card-title"
                      onClick={() => toggleSubtasks(task.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {task.title}
                    </span>
                    <div
                      className="more"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(`task-${task.id}`);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      ⋮
                    </div>
                    {openMenus[`task-${task.id}`] && (
                      <div className="card-menu" style={{ display: 'block' }}>
                        <a
                          href="#"
                          className="settings-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            openSettingsModal({ ...task, type: 'task' });
                          }}
                        >
                          Settings
                        </a>
                        <a
                          href="#"
                          className="remove-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            removeTask(task.id);
                          }}
                          style={{ color: '#e74c3c' }}
                        >
                          Remove
                        </a>
                      </div>
                    )}
                    {renderSettingsSummary({ ...task, type: 'task' })}
                    {expandedTasks[task.id] && (
                      <ul className="subtasks">
                        <li>Subtask 1</li>
                        <li>Subtask 2</li>
                        <li>Subtask 3</li>
                      </ul>
                    )}
                  </div>
                ))}
              </>
            )}
            <Link to="/create_task">
              <button
                className="button"
                style={{ fontSize: '1.5rem', display: 'block', margin: '1rem auto' }}
              >
                ＋ New Task
              </button>
            </Link>
          </div>
        </div>

        {/* Invite Section */}
        <div className="invite" style={{ position: 'relative' }}>
          <div className="avatars">
            <img src={avatar1} alt="Avatar 1" />
            <img src={avatar2} alt="Avatar 2" />
            <img src={avatar3} alt="Avatar 3" />
          </div>
          <div>Invite your teammates to start collaborating</div>

          {inviteVisible && (
            <form
              className="invite-form show"
              onSubmit={handleInviteSubmit}
              ref={inviteInputRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'white',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginTop: '0.5rem',
                zIndex: 100,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input type="email" name="email" placeholder="Enter email" required />
              <button type="submit" className="button">
                Send
              </button>
            </form>
          )}

          <button
            className="button invite-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setInviteVisible((v) => !v);
            }}
          >
            Invite
          </button>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {modalOpen && (
        <div
          id="modal"
          className="modal"
          style={{
            display: 'flex',
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal-content"
            style={{ background: '#fff', padding: '1rem', borderRadius: '8px', width: '300px', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <span
              className="modal-close"
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', cursor: 'pointer', fontSize: '1.5rem' }}
              onClick={() => setModalOpen(false)}
            >
              &times;
            </span>
            <div className="modal-body">
              <form id="settings-form" onSubmit={saveSettings}>
                {currentCard?.type === 'project' ? (
                  <>
                    <label>Project Name</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      required
                    />
                    <label>Implementation Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date || ''}
                      onChange={handleInputChange}
                    />
                    <label>Team</label>
                    <input
                      type="text"
                      name="team"
                      value={formData.team || ''}
                      onChange={handleInputChange}
                    />
                  </>
                ) : (
                  <>
                    <label>Task Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                    <label>Assigned User</label>
                    <input
                      type="text"
                      name="user"
                      value={formData.user || ''}
                      onChange={handleInputChange}
                    />
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status || 'To Do'}
                      onChange={handleInputChange}
                    >
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                    <label>Project</label>
                    <input
                      type="text"
                      name="project"
                      value={formData.project || ''}
                      onChange={handleInputChange}
                    />
                  </>
                )}
                <button type="submit" className="button">
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

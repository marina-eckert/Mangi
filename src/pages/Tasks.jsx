import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import '../assets/css/style.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    user: 'Alice',
    status: 'To Do',
    subtasks: [''],
  });

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
          throw new Error('Failed to fetch projects');
        }

        const projects = await projectsResponse.json();

        const tasksByProject = await Promise.all(
          projects.map(async (project) => {
            const tasksResponse = await fetch(`http://localhost:5000/api/projects/${project._id}/tasks`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              }
            });

            if (!tasksResponse.ok) {
              return { projectId: project._id, tasks: [] };
            }

            const tasks = await tasksResponse.json();
            return { projectId: project._id, tasks };
          })
        );

        setTasks(tasksByProject);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load projects or tasks');
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubtaskChange = (index, value) => {
    const updated = [...formData.subtasks];
    updated[index] = value;
    setFormData(prev => ({ ...prev, subtasks: updated }));
  };

  const addSubtask = () => {
    setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, ''] }));
  };

  const removeSubtask = (index) => {
    const updated = formData.subtasks.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, subtasks: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      taskTitle: formData.title,
      assignedTo: formData.user,
      status: formData.status,
      subtasks: formData.subtasks.filter(sub => sub.trim() !== ''),
    };

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const result = await response.json();
      setTasks(prev => [...prev, result]);
      setFormData({ title: '', user: 'Alice', status: 'To Do', subtasks: [''] });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="content">

        <div className="section">
          <h2 className="section-title">My Tasks</h2>
          <div className="task-columns">
            {['To Do', 'In Progress', 'Done'].map(status => (
              <div key={status} className="column" data-status={status}>
                <h3>{status}</h3>
                <div className="cards-container">
                  {tasks.filter(t => t.status === status).map(task => (
                    <div className="card" key={task._id}>
                      <strong>{task.title}</strong>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <ul style={{ margin: '0.5rem 0' }}>
                          {task.subtasks.map((sub, i) => <li key={i}>{sub}</li>)}
                        </ul>
                      )}
                      <div className="more">⋮</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal can go here if implemented later */}
    </div>
  );
}

export default Tasks;

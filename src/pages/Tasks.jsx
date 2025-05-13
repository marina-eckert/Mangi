import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import '../assets/css/style.css';

function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tasks');
        const data = await response.json();
        setTasks(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleCreateTask = () => {
    navigate('/create_task');
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
          <div className="tasks">
            {['To Do', 'In Progress', 'Done'].map((status) => (
              <div key={status}>
                <div className="progress">{status}</div>
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div className="card" key={task._id}>
                      {task.taskTitle}
                      <div className="more">⋮</div>
                    </div>
                  ))}
              </div>
            ))}
            <button
              className="button"
              style={{ fontSize: '1.5rem', margin: '1rem auto', display: 'block' }}
              onClick={handleCreateTask}
            >
              ＋ New Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;

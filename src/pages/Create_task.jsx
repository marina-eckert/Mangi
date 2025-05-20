import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';

function Create_task() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedProject, setAssignedProject] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('To Do');
  const [subtasks, setSubtasks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubtaskChange = (index, value) => {
    const updated = [...subtasks];
    updated[index] = value;
    setSubtasks(updated);
  };

  const addSubtask = () => {
    setSubtasks(prev => [...prev, '']);
  };

  const removeSubtask = (index) => {
    const updated = subtasks.filter((_, i) => i !== index);
    setSubtasks(updated);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!taskTitle || !taskType || !startDate || !endDate || !taskDescription || !assignedTo) {
      setError('Please fill in all fields');
      return;
    }

    const newTask = {
      taskTitle,
      taskType,
      startDate,
      endDate,
      taskDescription,
      assignedTo,
      assignedProject,
      status,
      subtasks: subtasks.filter(sub => sub.trim() !== ''),
    };

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        alert('Task created successfully!');
        navigate('/tasks');
        setTaskTitle('');
        setTaskType('');
        setStartDate('');
        setEndDate('');
        setTaskDescription('');
        setAssignedTo('');
        setAssignedProject('');
        setStatus('To Do');
        setSubtasks(['']);
      } else {
        setError('Failed to create task');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while creating the task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-task-page">
      <Header />
      <Sidebar />
      <div className="content">
        <div className="section">
          <h2 className="section-title">Tasks / Create a Task</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Task Type</label>
              <input
                type="text"
                placeholder="Task Type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Task Description</label>
              <textarea
                rows="4"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Assign to</label>
              <input
                type="text"
                placeholder="Assign to (User Name)"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Assign to Project</label>
              <select
                name="project"
                value={assignedProject}
                onChange={(e) => setAssignedProject(e.target.value)}
              >
                <option value="">— None —</option>
                <option value="Project 1">Project 1</option>
                <option value="Project 2">Project 2</option>
                <option value="Project 3">Project 3</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>

            <div className="form-group">
              <label>Subtasks</label>
              <div id="subtasks-container">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="subtask-input">
                    <input
                      type="text"
                      placeholder="Subtask"
                      value={subtask}
                      onChange={(e) => handleSubtaskChange(index, e.target.value)}
                    />
                    <button
                      type="button"
                      className="remove-subtask"
                      onClick={() => removeSubtask(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                id="add-subtask"
                className="button"
                onClick={addSubtask}
              >
                ＋ Add Subtask
              </button>
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Create_task;

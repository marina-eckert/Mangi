
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  FiTrash2,
  FiEdit2,
  FiX,
  FiCalendar,
  FiSend
} from 'react-icons/fi';
import {
  MdPersonOutline,
  MdAccountTree
} from 'react-icons/md';
import '../assets/css/style.css';

export default function Create_task() {
  const [projects, setProjects] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedProject, setAssignedProject] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState('Not started');
  const [priority, setPriority] = useState('Low');
  const [subtasks, setSubtasks] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    })();
  }, []);

  const navigate = useNavigate();

  const handleSubtaskChange = (i, val) => {
    const a = [...subtasks];
    a[i] = val;
    setSubtasks(a);
  };
    // Handle per-subtask field change with validation
  const handleSubtaskFieldChange = (index, field, value) => {
    setSubtasks(old => {
      const copy = [...old];
      const parentStart = startDate;
      const parentEnd = endDate;
      // Enforce within parent bounds
      if (field === 'startDate') {
        if (value < parentStart) value = parentStart;
        if (value > parentEnd) value = parentEnd;
      }
      if (field === 'endDate') {
        if (value > parentEnd) value = parentEnd;
        if (value < copy[index].startDate || value < parentStart) value = copy[index].startDate || parentStart;
      }
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };
  const addSubtask = () => setSubtasks(s => [...s, '']);
  const removeSubtask = i =>
    setSubtasks(s => s.filter((_, j) => j !== i));

  const handleSubmit = async e => {
    e.preventDefault();

    if (
      !taskTitle ||
      !taskType ||
      !startDate ||
      !endDate ||
      !taskDescription ||
      !assignedTo ||
      !assignedProject
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    // Build payload: include parent dates on every subtask
    const newTask = {
      title:       taskTitle,
      type:        taskType,
      startDate,
      endDate,
      description: taskDescription,
      assignedTo,
      status,
      priority,
      subtasks: subtasks
        .filter(s => s.trim())
        .map(s => ({
          title:     s,
          startDate,    // inherit
          endDate       // inherit
        })),
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:3000/api/projects/${assignedProject}/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newTask),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create task');
      }

      alert('Task created successfully!');
      navigate('/tasks');
    } catch (err) {
      console.error('Create task error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="create-task-page"
      style={{ display: 'flex', minHeight: '100vh' }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: '40px 0',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: 620,
            padding: 24,
            position: 'relative',
            fontFamily: 'sans-serif',
          }}
        >
          {/* ── top icons ── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div
              style={{ display: 'flex', gap: 12, color: '#6b7280' }}
            >
              <FiTrash2 style={{ cursor: 'pointer' }} />
              <FiEdit2 style={{ cursor: 'pointer' }} />
            </div>
            <FiX
              style={{ cursor: 'pointer', color: '#6b7280' }}
              onClick={() => navigate(-1)}
            />
          </div>

          {/* ── Title + Type + Dates ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '1rem',
              marginBottom: 24,
            }}
          >
            {/* Task Title */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: 4, color: '#6b7280' }}>
                Task Title
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                required
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                }}
              />
            </div>

            {/* Task Type */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: 4, color: '#6b7280' }}>
                Task Type
              </label>
              <input
                type="text"
                placeholder="e.g. Bug, Feature"
                value={taskType}
                onChange={e => setTaskType(e.target.value)}
                required
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                }}
              />
            </div>

            {/* Start Date */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: 4, color: '#6b7280' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                }}
              />
            </div>

            {/* End Date */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: 4, color: '#6b7280' }}>
                Due Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                }}
              />
            </div>
          </div>

          {/* ── Assignee + Status + Project ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem 2rem',
              marginBottom: 24,
            }}
          >
            {/* Assignee */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdPersonOutline style={{ fontSize: 20, color: '#6b7280' }} />
              <input
                type="text"
                placeholder="Assign to"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                }}
              />
            </div>

            {/* Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                }}
              >
                <option>Not started</option>
                <option>In progress</option>
                <option>Done</option>
              </select>
            </div>

            {/* Project */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MdAccountTree style={{ fontSize: 20, color: '#6b7280' }} />
              <select
                value={assignedProject}
                onChange={e => setAssignedProject(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                }}
              >
                <option value="">— None —</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Description ── */}
          <div style={{ marginBottom: 24 }}>
            <label
              style={{ color: '#6b7280', marginBottom: 8, display: 'block' }}
            >
              Description
            </label>
            <textarea
              rows={4}
              value={taskDescription}
              onChange={e => setTaskDescription(e.target.value)}
              required
              style={{
                width: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
              }}
            />
          </div>

          {/* ── Subtasks & Comments ── */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            {/* Subtasks
            <div style={{ flex: 1 }}>
              <label
                style={{ color: '#6b7280', marginBottom: 8, display: 'block' }}
              >
                Subtasks
              </label>
              {subtasks.map((sub, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      border: '2px solid #d1d5db',
                      borderRadius: '50%',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Subtask"
                    value={sub}
                    onChange={e => handleSubtaskChange(i, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '4px',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(i)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      fontSize: 16,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSubtask}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  cursor: 'pointer',
                }}
              >
                ＋ Add Subtask
              </button>
            </div> */}

            {/* Comments */}
            <div style={{ flex: 1 }}>
              <label
                style={{ color: '#6b7280', marginBottom: 8, display: 'block' }}
              >
                Comments
              </label>
              <div
                style={{
                  background: '#f3f4f6',
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 72,
                  position: 'relative',
                }}
              >
                <span style={{ color: '#6b7280' }}>No comments yet.</span>
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                    background: '#0284c7',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <FiSend color="#fff" />
                </button>
              </div>
            </div>
          </div>
                    {/* Subtasks Section
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: '#6b7280', marginBottom: 8, display: 'block' }}>Subtasks</label>
            {subtasks.map((st, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="Subtask title"
                  value={st.title}
                  onChange={e => handleSubtaskTitleChange(i, e.target.value)}
                  style={{ flex: 2, padding: '6px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <input
                  type="date"
                  value={st.startDate}
                  onChange={e => handleSubtaskFieldChange(i, 'startDate', e.target.value)}
                  style={{ flex: 1, padding: '6px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <input
                  type="date"
                  value={st.endDate}
                  onChange={e => handleSubtaskFieldChange(i, 'endDate', e.target.value)}
                  style={{ flex: 1, padding: '6px', border: '1px solid #e5e7eb', borderRadius: 8 }}
                />
                <button type="button" onClick={() => removeSubtask(i)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addSubtask} style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer' }}>＋ Add Subtask</button>
          </div> */}


          {/* ── submit ── */}
          {error && (
            <div style={{ color: '#e53e3e', marginBottom: 8 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#0f1a43',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            {loading ? 'Creating…' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

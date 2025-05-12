import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/style.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function Create_task() {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({
      taskTitle,
      taskType,
      startDate,
      endDate,
      taskDescription,
      assignedTo,
    });
  };

  return (
    <div className="create-task-page">
      <Header />
      <Sidebar />

      {/* Main Content */}
      <div className="content">
        <div className="section">
          <h2 className="section-title">Tasks / Create a task</h2>
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                placeholder="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Task Type</label>
              <input
                type="text"
                placeholder="Task Type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Task Description</label>
              <textarea
                rows="4"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Assign to</label>
              <input
                type="text"
                placeholder="User name"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
            <button type="submit" className="button">Create</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Create_task;

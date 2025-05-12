import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/style.css'; 
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function Create_project() {
  const [projectTitle, setProjectTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({
      projectTitle,
      projectType,
      startDate,
      endDate,
      projectDescription,
    });
  };

  return (
    <div className="create-project-page">
      <Header />
      <Sidebar />

      {/* Main Content */}
      <div className="content">
        <div className="section">
          <h2 className="section-title">Projects / Create a project</h2>
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group">
              <label>Project Title</label>
              <input
                type="text"
                placeholder="Project Title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)} // Update state
              />
            </div>
            <div className="form-group">
              <label>Project Type</label>
              <input
                type="text"
                placeholder="Project Type"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)} // Update state
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} // Update state
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} // Update state
                />
              </div>
            </div>
            <div className="form-group">
              <label>Project Description</label>
              <textarea
                rows="4"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)} // Update state
              />
            </div>
            <button type="submit" className="button">Create</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Create_project;

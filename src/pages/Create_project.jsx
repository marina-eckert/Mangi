import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/style.css'; 
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function Create_project() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const projectData = {
      title,
      type,
      startDate,
      endDate,
      description
    };

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'An error occurred');
      }

      alert('Project created successfully');
      navigate('/projects');
    } catch (error) {
      setLoading(false);
      setError(error.message || 'An error occurred');
    }
  };

  return (
    <div className="create-project-page">
      <Header />
      <Sidebar />

      {/* Main Content */}
      <div className="content">
        <div className="section">
          <h2 className="section-title">Projects / Create a project</h2>
          
          {/* Display error message if any */}
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group">
              <label>Project Title</label>
              <input
                type="text"
                placeholder="Project Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)} 
                required
              />
            </div>
            <div className="form-group">
              <label>Project Type</label>
              <input
                type="text"
                placeholder="Project Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
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
              <label>Project Description</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Create_project;

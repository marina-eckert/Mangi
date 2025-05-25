
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  FiTrash2,
  FiEdit2,
  FiX,
  FiCalendar
} from 'react-icons/fi';
import '../assets/css/style.css';

export default function Create_project() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    if (!title || !type || !startDate || !endDate || !description) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);

    const projectData = { title, type, startDate, endDate, description };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(projectData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to create project');

      alert('Project created successfully');
      navigate('/projects');
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Sidebar />

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 0'
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: 600,
            padding: 24,
            position: 'relative'
          }}
        >
          {/* top icons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 16,
            color: '#6b7280'
          }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <FiTrash2 style={{ cursor: 'pointer' }} />
              <FiEdit2 style={{ cursor: 'pointer' }} />
            </div>
            <FiX
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(-1)}
            />
          </div>

          {/* header */}
          <h2 style={{
            margin: 0,
            marginBottom: 16,
            fontSize: 20,
            fontWeight: 600,
            color: '#111827'
          }}>
            {title || 'New Project'}
          </h2>

          <hr style={{
            border: 'none',
            borderTop: '1px solid #e5e7eb',
            marginBottom: 24
          }} />

          {/* Title & Type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '1rem',
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: 4, color: '#6b7280' }}>
                Project Title
              </label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: 4, color: '#6b7280' }}>
                Project Type
              </label>
              <input
                type="text"
                placeholder="e.g. Research"
                value={type}
                onChange={e => setType(e.target.value)}
                required
                style={{
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 8
                }}
              />
            </div>
          </div>

          {/* Dates */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: 24,
            alignItems: 'end'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ color: '#6b7280' }}>Start Date</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCalendar style={{ color: '#6b7280' }} />
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  style={{
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    flex: 1
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ color: '#6b7280' }}>End Date</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCalendar style={{ color: '#6b7280' }} />
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                  style={{
                    padding: '8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    flex: 1
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              color: '#6b7280',
              marginBottom: 8,
              display: 'block'
            }}>
              Project Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              style={{
                width: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ color: '#e53e3e', marginBottom: 8 }}>
              {error}
            </div>
          )}

          {/* Submit */}
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
              fontSize: 16
            }}
          >
            {loading ? 'Creating…' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
}

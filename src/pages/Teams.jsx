import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';

function Teams() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError('Failed to load users');
        }
      } catch (err) {
        setError('An error occurred while fetching users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="content">
        <div className="section">
          <h2 className="section-title">Your Team</h2>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div>Loading users...</div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {users.map((user) => (
                <div className="card" key={user._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={user.avatar || '/assets/images/default-avatar.png'}
                    alt={user.username}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <div>{user.username || 'Unknown User'}</div>
                    <div>{user.email || 'No Email Provided'}</div>
                  </div>
                  <div className="more">⋮</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Teams;

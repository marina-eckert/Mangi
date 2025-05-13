import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';
import avatar from '../assets/images/avatar1.jpg';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Store user data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('data: ', data);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        setUser(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditProfile = () => {
    navigate('/settings');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Header />
      <Sidebar />

      <div className="content">
        <div
          className="section"
          style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}
        >
          <h2 className="section-title">Profile</h2>
          <img
            src={avatar}
            alt="Avatar"
            style={{ width: '100px', borderRadius: '50%', marginBottom: '1rem' }}
          />
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button
            className="button"
            style={{ marginTop: '1rem' }}
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;

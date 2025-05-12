import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';
import avatar from '../assets/images/avatar1.jpg';

function Profile() {
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/settings'); // Adjust this path based on your route setup
  };

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
          <h3>Martha Jones</h3>
          <p>martha.jones@example.com</p>
          <button className="button" style={{ marginTop: '1rem' }} onClick={handleEditProfile}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;

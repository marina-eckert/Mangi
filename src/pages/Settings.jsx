import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';

function Settings() {
  const [email, setEmail] = useState('user@example.com');
  const [username, setUsername] = useState('MarthaJones');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // You could send this data to an API here
    console.log({ email, username, password });
    alert('Changes saved.');
  };

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="content">
        <div className="section" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="section-title">Account Settings</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>User Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Change Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  className="toggle-password-settings"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ position: 'absolute', right: '10px', top: '50%', cursor: 'pointer', transform: 'translateY(-50%)' }}
                >
                  👁
                </span>
              </div>
            </div>
            <button type="submit" className="button">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;

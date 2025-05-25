import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';

function Settings() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:3000/api/users/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('data: ', data);
        if (!response.ok) throw new Error(data.msg || 'Failed to load user data');

        setEmail(data.email);
        setUsername(data.username);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/auth/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email, username }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.msg || 'Failed to save changes');
      alert(data.msg);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
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

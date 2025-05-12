import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import '../assets/css/style.css';

// Import images
import avatar1 from '../assets/images/avatar1.jpg';
import avatar2 from '../assets/images/avatar2.jpg';

function Teams() {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="content">
        <div className="section">
          <h2 className="section-title">Your Team</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="card">
              <img 
                src={avatar1} 
                alt="Alice" 
                style={{ width: '40px', borderRadius: '50%', marginRight: '.5rem', verticalAlign: 'middle' }} 
              />
              Alice
              <div className="more">⋮</div>
            </div>

            <div className="card">
              <img 
                src={avatar2} 
                alt="Bob" 
                style={{ width: '40px', borderRadius: '50%', marginRight: '.5rem', verticalAlign: 'middle' }} 
              />
              Bob
              <div className="more">⋮</div>
            </div>

            {/* Add more team members here */}

            <button
              className="button"
              style={{ fontSize: '1.5rem', margin: '1rem auto', display: 'block' }}
              onClick={() => navigate('/')}
            >
              ＋ Add Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Teams;

import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';

function Inbox() {
  return (
    <div>
      <Header />
      <Sidebar />

      <div className="content">
        <div className="section">
          <h2 className="section-title">Inbox</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li className="card">
              🔔 You have 3 new notifications
              <div className="more">⋮</div>
            </li>
            <li className="card">
              ✉️ Message from Alice
              <div className="more">⋮</div>
            </li>
            <li className="card">
              ✉️ Message from Bob
              <div className="more">⋮</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Inbox;

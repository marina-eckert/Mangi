import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';
import { useNavigate } from 'react-router-dom';

function Tasks() {
  const navigate = useNavigate();

  return (
    <div>
      <Header />
      <Sidebar />
      <div className="content">
        <div className="section">
          <h2 className="section-title">My Tasks</h2>
          <div className="tasks">
            <div className="progress">To Do</div>
            <div className="card">Task One<div className="more">⋮</div></div>

            <div className="progress">In Progress</div>
            <div className="card">Task Two<div className="more">⋮</div></div>

            <div className="progress">Done</div>
            <div className="card">Task Three<div className="more">⋮</div></div>

            <button
              className="button"
              style={{ fontSize: '1.5rem', margin: '1rem auto', display: 'block' }}
              onClick={() => navigate('/create_task')}
            >
              ＋ New Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tasks;

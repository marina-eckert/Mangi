import React, { useState } from 'react';
import '../assets/css/style.css';
import { useNavigate } from 'react-router-dom';

const Sign_in = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRememberMeChange = () => setRememberMe(!rememberMe);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);

        navigate('/dashboard');
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <div className="sign-in">
      <div className="form-card">
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signin-username">User name</label>
            <input
              id="signin-username"
              type="text"
              placeholder="Enter your user name"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="signin-password">Password</label>
            <input
              id="signin-password"
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={handlePasswordChange}
            />
            <span className="toggle-password">👁</span>
          </div>
          <div className="links">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
              />{' '}
              Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>
          <button
            type="submit"
            className="button"
           
          >
            Login
          </button>
        </form>
        <div className="bottom-text">
          Don’t have an Account? <a href="/sign_up">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Sign_in;

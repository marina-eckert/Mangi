import React, { useState } from 'react';
import bgImage from '../assets/images/bg-pattern.jpg'; // adjust the path if needed
import '../assets/css/style.css';

const Sign_up = () => {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add validation & registration logic
    console.log('Registering:', form);
  };

  return (
    <div
      className="sign-up-page"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}
    >
      <div className="form-card sign-up-form-card">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>User name</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your user name"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span className="toggle-password">👁</span>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <span className="toggle-password">👁</span>
          </div>
          <button
            type="submit"
            className="button"
          >
            Register
          </button>
        </form>
        <div className="bottom-text">
          Already have an Account? <a href="/sign_in">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default Sign_up;

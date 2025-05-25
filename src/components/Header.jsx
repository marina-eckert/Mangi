import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';

function Header({ onToggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const username = localStorage.getItem('username') || 'Guest';

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
      <img src={logo} width="100" height="100" alt="Logo" className="logo" />
      </div>
      {/* <div className="search">
        <input type="text" placeholder="Search…" />
      </div> */}
      {/* <h1 style={{ fontSize: 32, fontWeight: 700 }}>
          Welcome, {username}!
        </h1> */}
      <div className="nav-icons">
        <Link className="notification" to="/inbox">🔔</Link>
        <div className={`user user-dropdown ${dropdownOpen ? 'show' : ''}`} onClick={toggleDropdown} ref={dropdownRef}>
          👤
          <div className="dropdown-menu">
            <Link to="/profile">Profile</Link>
            <Link to="/settings">Account settings</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/help">Help Center</Link>
            <Link to="/sign_in" style={{ color: '#e74c3c' }}>Logout</Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

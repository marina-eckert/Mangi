import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/style.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

function Help() {
  return (
    <div>
    <Header />
    <Sidebar />

      <div className="content">
        <div className="section" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title">Help Center</h2>
          <h3>Frequently Asked Questions</h3>
          <p>
            <strong>Q:</strong> How do I reset my password?<br />
            <strong>A:</strong> Click “Forgot Password?” on the sign-in page.
          </p>
          <h3>Contact Support</h3>
          <form style={{ maxWidth: '600px', margin: '1rem auto' }}>
            <div className="form-group">
              <label>Your Message</label>
              <textarea rows="4" placeholder="Describe your issue"></textarea>
            </div>
            <button className="button" type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Help;

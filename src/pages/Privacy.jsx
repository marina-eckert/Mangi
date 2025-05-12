import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import '../assets/css/style.css';

function Privacy() {
  return (
    <div>
      <Header />
      <Sidebar />

      <div className="content">
        <div className="section" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="section-title">Privacy Policy</h2>
          <p>
            At Mangi, your privacy is our priority. Mangi is a project management system designed to help teams collaborate effectively, manage tasks, and track progress.
          </p>
          <br />
          <p>
            We collect only the information necessary to provide and improve our services. This includes your name, email, and usage data. We never sell your data to third parties.
          </p>
          <br />
          <p>
            All communication between your browser and our servers is encrypted. Access to your data is strictly limited to authorized personnel.
          </p>
          <br />
          <p>
            You have full control over your information. You can update or delete your account at any time through the settings page.
          </p>
          <br />
          <p>
            For more details or specific questions, feel free to reach out to our support team via the Help Center.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Privacy;

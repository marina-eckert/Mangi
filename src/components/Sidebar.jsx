import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo-small.png';

import {
  FiHome,         // Feather
  FiCalendar,
  FiBarChart2,
  FiPlus,
  FiSettings,
  FiLogOut,
  FiCompass,
  FiCheckCircle,
  //FiFillHome
 
} from 'react-icons/fi';    

import { MdAccountTree } from 'react-icons/md';

import { AiFillHome } from 'react-icons/ai'; 

const icons = [FiHome, FiCalendar, FiBarChart2, FiPlus, FiSettings, FiLogOut];

//const icons = ['🏠', '📅', '📊', '➕', '⚙️', '↩️']; // quick emoji placeholders

const TOP_ITEMS = [
  { to: '/dashboard',      icon: <FiHome /> },
  { to: '/projects',       icon: <FiCompass /> },
  { to: '/tree',        icon: <FiBarChart2 /> },
  { to: '/create_project', icon: <FiPlus /> },
];

const BOTTOM_ITEMS = [
  { to: '/settings', icon: <FiSettings /> },
  { to: '/sign_in',  icon: <FiLogOut /> },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  const IconLink = ({ to, icon }) => (
    <Link
      to={to}
      className="sidebar-icon"
      style={{ opacity: pathname.startsWith(to) ? 1 : 0.5 }}
    >
      {icon}
    </Link>
  );

   return (
  <aside
    className="sidebar"
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
  >

     <div style={{ marginBottom: 40, marginTop: 53 }}>
          <img
            src={logo}
            alt="App Logo"
            style={{ height: 40 , objectFit: 'contain' }}
          />
        </div>
    {/* blank slot below header */}
    <div style={{ width: 0, height: 0 }} />

    {/* top cluster */}
    {TOP_ITEMS.map(({ to, icon }) => {
      const isActive = pathname.startsWith(to);
      return (
        <Link
          key={to}
          to={to}
          className="sidebar-icon"
          style={{
            opacity: isActive ? 1 : 0.9,
            color:   isActive ? 'orange' : 'white',
          }}
        >
          {icon}
        </Link>
      );
    })}

    
    <div style={{ flexGrow: 1 }} />

    {/* bottom cluster */}
    {BOTTOM_ITEMS.map(({ to, icon }) => {
      const isActive = pathname.startsWith(to);
      return (
        <Link
          key={to}
          to={to}
          className="sidebar-icon"
          style={{
            opacity: isActive ? 1 : 0.9,
            color:   isActive ? 'orange' : 'white',
          }}
        >
          {icon}
        </Link>
      );
    })}
  </aside>
);
}

// export default function Sidebar() {
//   const { pathname } = useLocation();

//   return (
//     <aside className="sidebar">
//       {[
//         { to: '/dashboard', icon: icons[0] },
//         { to: '/projects', icon: icons[1] },
//         { to: '/tasks', icon: icons[2] },
//         { to: '/create_project', icon: icons[3] },
//         { to: '/settings', icon: icons[4] },
//         { to: '/sign_in', icon: icons[5] },
//       ].map(({ to, icon }) => (
//         <Link key={to} to={to} style={{ opacity: pathname === to ? 1 : 0.6 }}>
//           {icon}
//         </Link>
//       ))}
//     </aside>
//   );
// }

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './PageLayout.css';

function PageLayout({ children }) {
  return (
    <div className="page-shell">
      <Sidebar />
      <div className="page-content">
        <Navbar />
        <main className="page-main">{children}</main>
      </div>
    </div>
  );
}

export default PageLayout;

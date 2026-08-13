import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const showBackButton = location.pathname !== '/dashboard';

  return (
    <header className="topbar">
      <style>{`
        .topbar-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 6px 12px;
          margin-right: 14px;
          color: var(--color-text);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .topbar-back-btn:hover {
          background: var(--color-light-bg);
          transform: translateX(-2px);
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {showBackButton && (
          <button type="button" onClick={() => navigate(-1)} className="topbar-back-btn">
            ← Back
          </button>
        )}
        <div>
          <p className="topbar-kicker">AI Lab Maintenance</p>
          <h2 className="topbar-title">Admin Panel</h2>
        </div>
      </div>

      <div className="topbar-user">
        <span className="topbar-dot" />
        {user?.name || 'Admin'}
      </div>
    </header>
  );
}

export default Navbar;
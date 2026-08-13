import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const { logout, organizationName, user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const roleLabel = isSuperAdmin ? 'Super Admin' : 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <strong>AI Lab Maintenance</strong>
        <span>{roleLabel}</span>
      </div>

      <nav className="sidebar-nav">
        {isSuperAdmin ? (
          <NavLink className="sidebar-link" to="/organizations">
            <span className="sidebar-icon">🏛️</span> Organizations
          </NavLink>
        ) : (
          <>
            <NavLink className="sidebar-link" to="/dashboard">
              <span className="sidebar-icon"></span> Dashboard
            </NavLink>
            <NavLink className="sidebar-link" to="/labs">
              <span className="sidebar-icon"></span> Labs
            </NavLink>
            <NavLink className="sidebar-link" to="/expenses">
              <span className="sidebar-icon"></span> Expenses
            </NavLink>
            {/* FIX: added matching sidebar-icon span so text aligns with the other links; removed dead animationDelay style (leftover from an old Sidebar version, does nothing here) */}
            <NavLink className="sidebar-link" to="/utilization">
              <span className="sidebar-icon"></span> Utilization
            </NavLink>
            <NavLink className="sidebar-link" to="/requests">
              <span className="sidebar-icon"></span> Requests
            </NavLink>
            <NavLink className="sidebar-link" to="/assignments">
              <span className="sidebar-icon"></span> Assignments
            </NavLink>
            <NavLink className="sidebar-link" to="/logs">
            <span className="sidebar-icon"></span> Logs
          </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
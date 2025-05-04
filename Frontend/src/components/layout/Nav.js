import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'react-feather';
import axios from 'axios';

const Navigation = ({ user, onLogout }) => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;

        // Only set hasNew if the count changes
        if (data.length > notifications.length) {
          setHasNew(true);
        }
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications.");
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [notifications.length]);

  const toggleModal = () => {
    setShowModal(!showModal);
    setHasNew(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">Kuya Koy's PMS</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname.includes('/projects') ? 'active' : ''}`} to="/projects">Projects</Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3 text-white">
              <div className="position-relative">
                <button className="btn btn-outline-light btn-sm" onClick={toggleModal}>
                  <Bell />
                  {hasNew && <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>}
                </button>
              </div>
              <span className="fw-light">Welcome, <strong>{user?.name}</strong></span>
              <button onClick={onLogout} className="btn btn-outline-light btn-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" onClick={toggleModal}>
          <div className="modal-dialog modal-dialog-scrollable" role="document" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Recent Activity</h5>
                <button type="button" className="btn-close" onClick={toggleModal}></button>
              </div>
              <div className="modal-body">
                {notifications.length === 0 ? (
                  <p>No recent activity.</p>
                ) : (
                  <ul className="list-group">
                    {notifications.map((activity) => (
                      <li key={activity.id} className="list-group-item">
                        <div>
                          <strong>{activity.user?.name || "Unknown"} – {activity.description}</strong>
                          <br />
                          <small className="text-muted">{new Date(activity.created_at).toLocaleString()}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;

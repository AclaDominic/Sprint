import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const RiskIssuePanel = ({ projectId, isOwner }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: "issue",
    title: "",
    description: "",
    impact_level: "medium",
  });

  useEffect(() => {
    fetchIssues();
  }, [projectId]);

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        `http://localhost:8000/api/projects/${projectId}/risks-issues`,
        { headers }
      );
      setIssues(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to load risks/issues.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (issue, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `http://localhost:8000/api/risks-issues/${issue.id}`,
        { ...issue, status: newStatus },
        { headers }
      );
      fetchIssues();
      setActivePopover(null);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        `http://localhost:8000/api/projects/${projectId}/risks-issues`,
        form,
        { headers }
      );
      setIssues((prev) => [res.data, ...prev]);
      setShowModal(false);
      setForm({ type: "issue", title: "", description: "", impact_level: "medium" });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit.");
    }
  };

  const StatusPopover = ({ issue }) => {
    const popoverRef = useRef(null);
    const nextStatus = issue.status === "closed" ? "open" : "closed";

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target)) {
          setActivePopover(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div
        ref={popoverRef}
        className="position-absolute bg-light border rounded p-2 shadow"
        style={{ zIndex: 1000 }}
      >
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleChangeStatus(issue, nextStatus)}
        >
          Change to "{nextStatus}"
        </button>
      </div>
    );
  };

  if (loading) return <div>Loading Risks/Issues...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Project Risks & Issues</h5>
        <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
          Report
        </button>
      </div>
      <div className="card-body">
        {issues.length === 0 ? (
          <p>No risks or issues reported for this project.</p>
        ) : (
          <ul className="list-group">
            {issues.map((issue) => (
              <li
                key={issue.id}
                className="list-group-item position-relative d-flex justify-content-between align-items-start flex-column flex-md-row"
              >
                <div className="me-3">
                  <strong>{issue.title}</strong>
                  <p className="mb-1 text-muted">{issue.description}</p>
                  <p className="mb-1">
                    <small className="text-muted">
                      <strong>Type:</strong> {issue.type} | <strong>Impact:</strong> {issue.impact_level}
                    </small>
                  </p>
                </div>
                <div className="text-end">
                  <span
                    className={`badge bg-${issue.status === "open" ? "danger" : "success"}`}
                  >
                    {issue.status}
                  </span>
                  {(isOwner || issue.type === "issue") && (
                    <button
                      className="btn btn-sm btn-link ms-2"
                      onClick={() =>
                        setActivePopover(activePopover === issue.id ? null : issue.id)
                      }
                    >
                      Change Status
                    </button>
                  )}
                  {activePopover === issue.id && <StatusPopover issue={issue} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Report Risk/Issue</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    name="type"
                    value={form.type}
                    onChange={handleInputChange}
                    disabled={!isOwner}
                  >
                    <option value="issue">Issue</option>
                    <option value="risk">Risk</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Impact Level</label>
                  <select
                    className="form-select"
                    name="impact_level"
                    value={form.impact_level}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskIssuePanel;

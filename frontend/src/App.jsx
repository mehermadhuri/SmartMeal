import { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smartmeal-backend-l5xs.onrender.com/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form input state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Pending'
  });

  // Helper to show temporary alert messages
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 4000);
  };

  // 1. Fetch all tasks from backend on component mount
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks (HTTP ${response.status})`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      showMessage('error', 'Failed to connect to backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 2. Add new task or Update existing task
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Title is required
    if (!formData.title.trim()) {
      showMessage('error', 'Task title is required and cannot be empty!');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate || null,
      status: formData.status || 'Pending'
    };

    try {
      if (editingId) {
        // PUT /api/tasks/{id} - Update existing task
        const response = await fetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to update task (HTTP ${response.status})`);
        }

        showMessage('success', 'Task updated successfully!');
        setEditingId(null);
      } else {
        // POST /api/tasks - Create new task
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to create task (HTTP ${response.status})`);
        }

        showMessage('success', 'Task added successfully!');
      }

      // Reset form and reload fresh data from MySQL
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: 'Pending'
      });
      fetchTasks();
    } catch (err) {
      console.error('Submit error:', err);
      showMessage('error', err.message);
    }
  };

  // 3. Edit task - populate form with selected task details
  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      status: task.status || 'Pending'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      status: 'Pending'
    });
  };

  // 4. Delete task
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to delete task (HTTP ${response.status})`);
      }

      showMessage('success', 'Task deleted successfully!');
      if (editingId === id) {
        handleCancelEdit();
      }
      fetchTasks();
    } catch (err) {
      console.error('Delete error:', err);
      showMessage('error', err.message);
    }
  };

  // 5. Change task status between Pending and Completed
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const response = await fetch(`${API_BASE_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update status (HTTP ${response.status})`);
      }

      showMessage('success', `Task marked as ${newStatus}!`);
      fetchTasks();
    } catch (err) {
      console.error('Status toggle error:', err);
      showMessage('error', err.message);
    }
  };

  // 6. Filter tasks based on selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'Pending') return task.status === 'Pending';
    if (filter === 'Completed') return task.status === 'Completed';
    return true; // ALL
  });

  // Calculate task summary counts
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>📋 Daily Task Manager</h1>
        <p className="subtitle">Full Stack Java Spring Boot + React + MySQL Application</p>
      </header>

      {/* Alert Notification Messages */}
      {message.text && (
        <div className={`alert-banner alert-${message.type}`}>
          <span>{message.type === 'success' ? '✅ ' : '⚠️ '}{message.text}</span>
          <button className="close-btn" onClick={() => setMessage({ type: '', text: '' })}>✕</button>
        </div>
      )}

      {/* Task Form (Add or Edit) */}
      <section className="card form-card">
        <h2>{editingId ? '✏️ Edit Task' : '➕ Add New Task'}</h2>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="title">Task Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Complete Spring Boot Lab Manual"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="dueDate">Due Date</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>

            {editingId && (
              <div className="form-group flex-1">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="Enter task details, notes, or instructions..."
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? '💾 Save Changes' : '➕ Add Task'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
              >
                ✕ Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Filter and Summary Bar */}
      <section className="card list-card">
        <div className="controls-bar">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All Tasks ({totalCount})
            </button>
            <button
              className={`filter-btn ${filter === 'Pending' ? 'active' : ''}`}
              onClick={() => setFilter('Pending')}
            >
              ⏳ Pending ({pendingCount})
            </button>
            <button
              className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`}
              onClick={() => setFilter('Completed')}
            >
              ✅ Completed ({completedCount})
            </button>
          </div>

          <button
            className="btn btn-refresh"
            onClick={fetchTasks}
            title="Refresh from MySQL"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Task Table */}
        <div className="table-responsive">
          {loading ? (
            <div className="state-message">Loading tasks from database...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="state-message">
              {tasks.length === 0
                ? 'No tasks found. Add your first task above!'
                : `No tasks match the "${filter}" filter.`}
            </div>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th style={{ width: '130px' }}>Due Date</th>
                  <th style={{ width: '140px' }}>Status</th>
                  <th style={{ width: '160px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className={task.status === 'Completed' ? 'completed-row' : ''}>
                    <td>#{task.id}</td>
                    <td className="task-title-cell">
                      <strong>{task.title}</strong>
                    </td>
                    <td className="task-desc-cell">
                      {task.description || <span className="text-muted">—</span>}
                    </td>
                    <td>
                      {task.dueDate || <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <button
                        className={`status-pill ${task.status === 'Completed' ? 'pill-completed' : 'pill-pending'}`}
                        onClick={() => handleToggleStatus(task)}
                        title="Click to toggle status"
                      >
                        {task.status === 'Completed' ? '✅ Completed' : '⏳ Pending'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(task)}
                          title="Edit Task"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(task.id)}
                          title="Delete Task"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <p>Daily Task Management System • Spring Boot + React + MySQL</p>
      </footer>
    </div>
  );
}

export default App;

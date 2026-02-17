import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import type { Task } from '../hooks/useIndexedDB';
import './TaskManager.css';

export const TaskManager: React.FC = () => {
  const { tasks, loading, error, updateTask, deleteTask } = useTaskContext();

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch (err) {
      console.error('Error updating task:', err);
      alert('Error al actualizar la tarea');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await deleteTask(id);
      } catch (err) {
        console.error('Error deleting task:', err);
        alert('Error al eliminar la tarea');
      }
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  if (loading) {
    return (
      <div className="task-manager">
        <div className="loading">Cargando tareas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-manager">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="task-manager">
      <div className="stats">
        <div className="stat">
          <span className="stat-label">Pendientes</span>
          <span className="stat-value pending">{pendingCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Completadas</span>
          <span className="stat-value completed">{completedCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Total</span>
          <span className="stat-value total">{tasks.length}</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>📝 No hay tareas aún</p>
          <p className="hint">Crea tu primera tarea usando el formulario arriba</p>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <div className="task-header">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task)}
                  aria-label={`Marcar ${task.title} como ${
                    task.completed ? 'pendiente' : 'completada'
                  }`}
                  className="task-checkbox"
                />
                <h3 className="task-title">{task.title}</h3>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-footer">
                <span className="task-date">
                  {new Date(task.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(task.id)}
                  aria-label={`Eliminar ${task.title}`}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length > 0 && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

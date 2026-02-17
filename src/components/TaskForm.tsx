import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import './TaskForm.css';

export const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useTaskContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Por favor ingresa un título');
      return;
    }

    try {
      setIsSubmitting(true);
      await addTask(title.trim(), description.trim());
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ingresa el título de la tarea"
          disabled={isSubmitting}
          maxLength={100}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ingresa una descripción (opcional)"
          disabled={isSubmitting}
          maxLength={500}
          rows={3}
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="submit-btn">
        {isSubmitting ? 'Creando...' : 'Crear Tarea'}
      </button>
    </form>
  );
};

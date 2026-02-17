import { useState, useEffect, useCallback } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = 'TaskManagerDB';
const STORE_NAME = 'tasks';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

// Inicializar la base de datos
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('completed', 'completed', { unique: false });
      }
    };
  });
};

// Hook personalizado para manejar tareas con IndexedDB
export const useIndexedDB = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las tareas
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const database = await initDB();
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('createdAt');
      const range = IDBKeyRange.lowerBound(0);
      const request = index.getAll(range);

      return new Promise<Task[]>((resolve, reject) => {
        request.onsuccess = () => {
          const allTasks = request.result.reverse(); // Más recientes primero
          setTasks(allTasks);
          resolve(allTasks);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error loading tasks';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear tarea
  const addTask = useCallback(
    async (title: string, description: string): Promise<Task> => {
      const database = await initDB();
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random()}`,
        title,
        description,
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(newTask);

        request.onsuccess = () => {
          setTasks((prev) => [newTask, ...prev]);
          resolve(newTask);
        };
        request.onerror = () => reject(request.error);
      });
    },
    []
  );

  // Actualizar tarea
  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<Task> => {
    const database = await initDB();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const task = getRequest.result as Task | undefined;
        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const updatedTask: Task = {
          ...task,
          ...updates,
          id: task.id, // Asegurar que el ID no cambie
          updatedAt: Date.now(),
        };

        const updateRequest = store.put(updatedTask);
        updateRequest.onsuccess = () => {
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? updatedTask : t))
          );
          resolve(updatedTask);
        };
        updateRequest.onerror = () => reject(updateRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }, []);

  // Eliminar tarea
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    const database = await initDB();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }, []);

  // Limpiar todas las tareas
  const clearAll = useCallback(async (): Promise<void> => {
    const database = await initDB();
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        setTasks([]);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }, []);

  // Cargar tareas al montar el componente
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    clearAll,
    loadTasks,
  };
};

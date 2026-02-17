import { useEffect, useState } from 'react';
import { TaskProvider } from './contexts/TaskContext';
import { TaskForm } from './components/TaskForm';
import { TaskManager } from './components/TaskManager';
import './App.css';

function App() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Detectar cambios de conectividad
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detectar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Detectar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    (installPrompt as any).prompt();
    const { outcome } = await (installPrompt as any).userChoice;

    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <TaskProvider>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">📋 Task Manager PWA</h1>
            <div className="header-controls">
              {!isInstalled && installPrompt && (
                <button
                  className="install-btn"
                  onClick={handleInstall}
                  title="Instalar aplicación"
                >
                  ⬇️ Instalar App
                </button>
              )}
              {isInstalled && (
                <span className="installed-badge">✅ Instalada</span>
              )}
              <span
                className={`status-indicator ${isOnline ? 'online' : 'offline'}`}
                title={isOnline ? 'Conectado' : 'Sin conexión'}
              >
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </span>
            </div>
          </div>
        </header>

        <main className="app-main">
          <div className="container">
            <section className="form-section">
              <h2 className="section-title">Nueva Tarea</h2>
              <TaskForm />
            </section>

            <section className="tasks-section">
              <h2 className="section-title">Mis Tareas</h2>
              <TaskManager />
            </section>
          </div>
        </main>

        <footer className="app-footer">
          <p>
            PWA Task Manager | Construido con React + TypeScript + Service Workers
          </p>
          <p className="offline-notice">
            {!isOnline && '📴 Estás sin conexión. Los cambios se sincronizarán cuando vuelvas a estar online.'}
          </p>
        </footer>
      </div>
    </TaskProvider>
  );
}

export default App;

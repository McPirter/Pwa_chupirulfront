import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { testOfflineSync, simulateOfflineData } from '../utils/offlineTest';
import './Auth.css';

const Dashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.getUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError(err.message || 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_OFFLINE_DATA'
        });
        console.log('Sincronización iniciada');
      }
    } catch (error) {
      console.error('Error iniciando sincronización:', error);
    }
  };

  const debugOfflineData = async () => {
    try {
      await apiService.debugOfflineData();
    } catch (error) {
      console.error('Error en debug:', error);
    }
  };

  const testSync = async () => {
    try {
      await testOfflineSync();
    } catch (error) {
      console.error('Error en test sync:', error);
    }
  };

  const addTestData = async () => {
    try {
      await simulateOfflineData();
      console.log('Datos de prueba agregados. Usa "Debug Datos Offline" para verlos.');
    } catch (error) {
      console.error('Error agregando datos de prueba:', error);
    }
  };

  return (
    <div className="dashboard">
      {!isOnline && (
        <div className="offline-indicator">
          Sin conexión - Los datos se sincronizarán cuando vuelva la conexión
        </div>
      )}
      
      <h1>Bienvenido, {user.name}</h1>
      
      <div className="user-info">
        <h2>Información del Usuario</h2>
        <div className="user-details">
          <div className="user-detail">
            <strong>ID:</strong>
            <span>{user.id}</span>
          </div>
          <div className="user-detail">
            <strong>Nombre:</strong>
            <span>{user.name}</span>
          </div>
          <div className="user-detail">
            <strong>Email:</strong>
            <span>{user.email}</span>
          </div>
          <div className="user-detail">
            <strong>Rol:</strong>
            <span>{user.role}</span>
          </div>
          <div className="user-detail">
            <strong>Estado:</strong>
            <span className={isOnline ? 'sync-status' : 'sync-status offline'}>
              {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
          </div>
        </div>
        
        <button onClick={triggerSync} className="auth-button">
          Sincronizar Datos Offline
        </button>
        
        <button onClick={debugOfflineData} className="auth-button" style={{background: '#4ecdc4'}}>
          Debug Datos Offline
        </button>
        
        <button onClick={testSync} className="auth-button" style={{background: '#ff6b6b'}}>
          Test Sincronización
        </button>
        
        <button onClick={addTestData} className="auth-button" style={{background: '#f39c12'}}>
          Agregar Datos de Prueba
        </button>
        
        <button onClick={onLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>

      <div className="user-info">
        <h2>Lista de Usuarios</h2>
        <button 
          onClick={loadUsers} 
          disabled={loading}
          className="auth-button"
        >
          {loading ? 'Cargando...' : 'Cargar Usuarios'}
        </button>
        
        {error && <div className="error-message">{error}</div>}
        
        {users.length > 0 && (
          <div className="users-list">
            {users.map((u) => (
              <div key={u._id || u.id} className="user-item">
                <strong>{u.name}</strong> - {u.email}
                {u.phone && <span> - {u.phone}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

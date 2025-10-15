import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import notificationService from '../services/notificationService';
import { testOfflineSync, simulateOfflineData } from '../utils/offlineTest';
import './Auth.css';

const Dashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar si las notificaciones están habilitadas
    checkNotificationStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const isSubscribed = await notificationService.isSubscribed();
      setNotificationsEnabled(isSubscribed);
    } catch (error) {
      console.error('Error verificando estado de notificaciones:', error);
    }
  };

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

  const enableNotifications = async () => {
    setNotificationLoading(true);
    try {
      await notificationService.setupNotifications(user.id);
      setNotificationsEnabled(true);
      alert('¡Notificaciones habilitadas exitosamente!');
    } catch (error) {
      console.error('Error habilitando notificaciones:', error);
      alert('Error habilitando notificaciones: ' + error.message);
    } finally {
      setNotificationLoading(false);
    }
  };

  const sendHelloNotification = async () => {
    try {
      await notificationService.sendTestNotification(
        user.id, 
        '¡Hola! 👋', 
        `¡Hola ${user.name}! Esta es una notificación de prueba desde tu PWA.`
      );
      alert('¡Notificación enviada! Revisa tu bandeja de notificaciones.');
    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('Error enviando notificación: ' + error.message);
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
        
        {!notificationsEnabled ? (
          <button 
            onClick={enableNotifications} 
            disabled={notificationLoading}
            className="auth-button" 
            style={{background: '#9b59b6'}}
          >
            {notificationLoading ? 'Configurando...' : '🔔 Habilitar Notificaciones'}
          </button>
        ) : (
          <button 
            onClick={sendHelloNotification} 
            className="auth-button" 
            style={{background: '#27ae60'}}
          >
            👋 ¡Decir Hola!
          </button>
        )}
        
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

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

  // 🔽 Estados nuevos para la notificación personalizada (ya los tenías)
  const [selectedUser, setSelectedUser] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');

  // 🔽 EFECTO 1: Manejar estado online/offline (Modificado)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Quitamos 'checkNotificationStatus()' de aquí para manejarlo en el nuevo efecto
    // que depende del usuario.

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Se ejecuta solo una vez al montar

  // 🔽 NUEVO EFECTO 2: Manejar lógica de Notificaciones al cargar
  useEffect(() => {
    // Si no tenemos al usuario, no podemos suscribirlo.
    if (!user || !user.id) {
      return;
    }

    // Función asíncrona para manejar la lógica de notificaciones
    const setupNotificationsOnLoad = async () => {
      try {
        // 1. Primero, verificamos si ya están suscritas
        const isSubscribed = await notificationService.isSubscribed();
        if (isSubscribed) {
          setNotificationsEnabled(true);
          return; // Ya está suscrito, no hacemos nada más
        }

        // 2. Si no está suscrito, verificamos el permiso
        // 'default' significa que el navegador nunca ha preguntado
        if ('Notification' in window && Notification.permission === 'default') {
          // 3. Pedimos permiso (esta es la lógica de tu botón)
          console.log('Solicitando permiso de notificaciones al cargar...');
          setNotificationLoading(true); 
          await notificationService.setupNotifications(user.id);
          setNotificationsEnabled(true);
          console.log('Notificaciones habilitadas exitosamente.');
          // (Quitamos los 'alert' para que no sea molesto al cargar)
        } else if (Notification.permission === 'granted') {
          // El permiso está dado, pero no la suscripción (Caso raro).
          // Intentamos suscribir sin molestar.
          await notificationService.setupNotifications(user.id);
          setNotificationsEnabled(true);
        }
        // Si el permiso es 'denied', no podemos hacer nada automáticamente.
        // El botón seguirá visible por si el usuario quiere re-intentar.

      } catch (error) {
        console.error('Error configurando notificaciones al cargar:', error);
        // No mostramos 'alert' de error al cargar, solo en consola.
      } finally {
        setNotificationLoading(false);
      }
    };

    setupNotificationsOnLoad();

  }, [user]); // 👈 Depende de 'user'. Se ejecuta cuando 'user' esté disponible.

  
  // Esta función se mantiene, pero ahora es llamada por el botón
  // o si el usuario recarga la página (desde el efecto 2).
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

  // 🔽 FUNCIÓN DEL BOTÓN (Modificada con chequeo 'denied')
  const enableNotifications = async () => {
    setNotificationLoading(true);
    try {
      // MEJORA: Añadimos un check para el caso 'denied'
      if ('Notification' in window && Notification.permission === 'denied') {
        alert('Las notificaciones están bloqueadas. Por favor, habilítalas manualmente en la configuración de tu navegador (junto a la URL) y vuelve a intentarlo.');
        setNotificationLoading(false);
        return;
      }

      // La lógica original de tu botón
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

  // 🔽 Nueva función para enviar notificaciones personalizadas (ya la tenías)
  const sendCustomNotification = async () => {
    if (!selectedUser) {
      alert('Selecciona un usuario para enviar la notificación.');
      return;
    }

    if (!notifTitle || !notifBody) {
      alert('Por favor, completa el título y el mensaje.');
      return;
    }

    try {
      await notificationService.sendNotificationToUser(selectedUser, notifTitle, notifBody);
      alert('✅ Notificación enviada correctamente');
      setNotifTitle('');
      setNotifBody('');
    } catch (error) {
      alert('❌ Error enviando notificación: '+ a + error.message);
    }
  };

  // 🔽 EL CÓDIGO JSX (return) SE MANTIENE EXACTAMENTE IGUAL
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

      {/* 🔽 Apartado para enviar notificación personalizada (ya lo tenías) */}
      <div className="user-info">
        <h2>Enviar Notificación a un Usuario</h2>
        <p>Selecciona un usuario y envíale una notificación personalizada.</p>

        <select
          onChange={(e) => setSelectedUser(e.target.value)}
          defaultValue=""
          className="auth-input"
        >
          <option value="" disabled>Seleccionar usuario</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} - {u.email}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Título de la notificación"
          value={notifTitle}
          onChange={(e) => setNotifTitle(e.target.value)}
          className="auth-input"
        />

        <textarea
          placeholder="Contenido del mensaje"
          value={notifBody}
          onChange={(e) => setNotifBody(e.target.value)}
          className="auth-input"
        />

        <button
          onClick={sendCustomNotification}
          className="auth-button"
          style={{ background: '#3498db' }}
        >
          🚀 Enviar Notificación
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
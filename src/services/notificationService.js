const API_BASE_URL = 'http://localhost:3000/api';

class NotificationService {
  constructor() {
    this.publicKey = null;
    this.registration = null;
  }

  // Obtener la clave pública del servidor
  async getPublicKey() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/public-key`);
      const data = await response.json();
      this.publicKey = data.publicKey;
      return this.publicKey;
    } catch (error) {
      console.error('Error obteniendo clave pública:', error);
      throw error;
    }
  }

  // Verificar si las notificaciones están soportadas
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Solicitar permisos de notificación
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Las notificaciones push no están soportadas en este navegador');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Permisos de notificación denegados');
    }

    return permission;
  }

  // Registrar el service worker
  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', this.registration);
      return this.registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      throw error;
    }
  }

  // Suscribirse a notificaciones push
  async subscribe(userId) {
    try {
      // Obtener la clave pública si no la tenemos
      if (!this.publicKey) {
        await this.getPublicKey();
      }

      // Convertir la clave pública a formato Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(this.publicKey);

      // Suscribirse a push
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      // Enviar la suscripción al servidor
      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          subscription: subscription
        })
      });

      if (!response.ok) {
        throw new Error('Error suscribiendo a notificaciones');
      }

      console.log('Suscripción exitosa:', subscription);
      return subscription;

    } catch (error) {
      console.error('Error suscribiéndose a notificaciones:', error);
      throw error;
    }
  }

  // Enviar notificación de prueba
  async sendTestNotification(userId, title = '¡Hola!', body = 'Esta es una notificación de prueba') {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          title: title,
          body: body,
          icon: '/neko.png',
          url: '/'
        })
      });

      if (!response.ok) {
        throw new Error('Error enviando notificación');
      }

      console.log('Notificación enviada exitosamente');
      return true;

    } catch (error) {
      console.error('Error enviando notificación:', error);
      throw error;
    }
  }

  // Configurar notificaciones completas (permisos + suscripción)
  async setupNotifications(userId) {
    try {
      // 1. Verificar soporte
      if (!this.isSupported()) {
        throw new Error('Las notificaciones push no están soportadas');
      }

      // 2. Solicitar permisos
      await this.requestPermission();

      // 3. Registrar service worker
      await this.registerServiceWorker();

      // 4. Suscribirse
      await this.subscribe(userId);

      console.log('Notificaciones configuradas exitosamente');
      return true;

    } catch (error) {
      console.error('Error configurando notificaciones:', error);
      throw error;
    }
  }

  // Convertir clave base64 a Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Verificar si ya está suscrito
  async isSubscribed() {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.ready;
      }
      
      const subscription = await this.registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Error verificando suscripción:', error);
      return false;
    }
  }
}

export default new NotificationService();

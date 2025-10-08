# Chupirul PWA - Login y Registro Offline

Una aplicación PWA (Progressive Web App) con sistema de login y registro que funciona offline, utilizando IndexedDB para almacenamiento local y Service Worker para sincronización automática.

## Características

- ✅ **Sistema de Login y Registro** con formularios responsivos
- ✅ **Funcionamiento Offline** - Los datos se guardan localmente cuando no hay conexión
- ✅ **Sincronización Automática** - Los datos offline se sincronizan cuando vuelve la conexión
- ✅ **PWA Completa** - Instalable, splash screen, manifest optimizado
- ✅ **Service Worker** - Manejo de cache y sincronización en segundo plano
- ✅ **IndexedDB** - Almacenamiento local robusto para datos offline
- ✅ **UI Moderna** - Diseño responsivo con gradientes y animaciones

## Tecnologías Utilizadas

- **React 19** - Framework principal
- **Vite** - Build tool y dev server
- **Service Worker** - Para funcionalidad offline
- **IndexedDB** - Almacenamiento local
- **CSS3** - Estilos modernos con gradientes y animaciones

## Instalación y Uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar el backend
Asegúrate de que tu API esté corriendo en `http://localhost:3000` con los endpoints:
- `POST /api/register` - Registro de usuarios
- `GET /api/users` - Obtener lista de usuarios
- `GET /api/user/:id` - Obtener usuario específico

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

### 4. Construir para producción
```bash
npm run build
```

### 5. Preview de producción
```bash
npm run preview
```

## Funcionalidades Offline

### Almacenamiento Local
- Los registros fallidos se guardan automáticamente en IndexedDB
- Los datos persisten entre sesiones del navegador
- Interfaz visual que indica el estado de conexión

### Sincronización Automática
- Cuando se restaura la conexión, los datos se sincronizan automáticamente
- El Service Worker maneja la sincronización en segundo plano
- Los datos sincronizados se eliminan de IndexedDB

### Service Worker
- Cache de assets estáticos para funcionamiento offline
- Listener de eventos de sincronización
- Manejo automático de requests fallidos

## Estructura del Proyecto

```
src/
├── components/
│   ├── Login.jsx          # Componente de login
│   ├── Register.jsx       # Componente de registro
│   ├── Dashboard.jsx      # Panel principal del usuario
│   └── Auth.css          # Estilos de autenticación
├── services/
│   └── apiService.js     # Servicio de API con manejo offline
├── App.jsx               # Componente principal
├── main.jsx              # Punto de entrada
└── App.css               # Estilos globales

sw.js                     # Service Worker
manifest.json             # Manifest PWA
```

## API Endpoints Requeridos

La aplicación espera los siguientes endpoints en `http://localhost:3000/api`:

### POST /api/register
Registra un nuevo usuario
```json
{
  "name": "string",
  "email": "string", 
  "password": "string",
  "phone": "string (opcional)"
}
```

### GET /api/users
Obtiene lista de todos los usuarios

### GET /api/user/:id
Obtiene un usuario específico por ID

## Características PWA

- **Instalable** - Se puede instalar como app nativa
- **Splash Screen** - Pantalla de carga personalizada
- **Offline First** - Funciona sin conexión
- **Responsive** - Adaptable a diferentes dispositivos
- **Fast Loading** - Carga rápida con cache inteligente

## Testing Offline

1. Abre las DevTools (F12)
2. Ve a la pestaña "Network"
3. Selecciona "Offline" en el dropdown
4. Intenta registrar un usuario
5. Verás que se guarda en IndexedDB
6. Restaura la conexión
7. Los datos se sincronizarán automáticamente

## Notas de Desarrollo

- El login es simulado (no hay endpoint de login en la API proporcionada)
- Los datos offline se sincronizan cuando vuelve la conexión
- El Service Worker se actualiza automáticamente
- La aplicación es completamente funcional offline
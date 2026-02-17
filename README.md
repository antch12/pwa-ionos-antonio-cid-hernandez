# 📋 PWA Task Manager

Aplicación Web Progresiva (PWA) funcional desarrollada con **React 19** + **TypeScript** + **Vite**, desplegada en **Docker** con **Nginx** y **certificados SSL** en **IONOS**.

[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-multi--stage-blue?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 Características Principales

✅ **PWA Completa**: Instalable en pantalla de inicio  
✅ **Offline First**: Funciona sin conexión a internet  
✅ **Service Workers**: Múltiples estrategias de caché  
✅ **CRUD Completo**: Crear, leer, actualizar, eliminar tareas  
✅ **IndexedDB**: Persistencia de datos en el cliente  
✅ **TypeScript**: Código seguro de tipos  
✅ **Responsive**: Optimizado para móviles y escritorio  
✅ **Docker**: Contenedorización multi-etapa  
✅ **HTTPS**: Certificados SSL automáticos  
✅ **Lighthouse**: Cumple todos los requisitos PWA  

---

## 🔍 Investigación Teórica (Parte 1)

### 1. Web App Manifest (manifest.json)

El **manifest.json** define metadatos sobre la PWA:

- **`theme_color` / `background_color`**: Colores de la interfaz
- **`display: standalone`**: Se ejecuta como app nativa (sin barras del navegador)
- **`icons`**: Íconos para diferentes dispositivos (192x192, 512x512, maskable)

**Importancia**: Sin manifest válido, el navegador NUNCA mostrará el prompt de instalación.

### 2. Service Workers

Los **Service Workers** son scripts JavaScript que actúan como proxy de red:

```
Solicitud de App → Service Worker → Caché/Red → Respuesta
```

**Ciclo de Vida**:
- **Installation**: Precachear recursos críticos
- **Activation**: Limpiar cachés antiguos
- **Fetching**: Interceptar y controlar solicitudes

### 3. Estrategias de Caché

| Estrategia | Uso | Ventaja |
|-----------|-----|---------|
| **Cache First** | Assets (CSS, JS, imágenes) | ⚡ Máxima velocidad |
| **Network First** | APIs dinámicas | 📡 Datos siempre frescos |
| **Stale-While-Revalidate** | Feeds, artículos | ⚡ Rápido + actualización eventual |

### 4. Seguridad y HTTPS

❌ Los Service Workers **NO** funcionan en HTTP (excepto localhost)  
✅ HTTPS es OBLIGATORIO para:
- Prevenir ataques man-in-the-middle
- Asegurar entrega confiable del SW
- Cumplir especificación W3C

El **certificado SSL válido** es requisito para que aparezca el prompt de instalación.

---

## 🛠 Implementación Técnica (Parte 2)

### Stack Tecnológico

```
Frontend:  React 19 + TypeScript + Vite
Estado:    Context API + Hooks
Almacén:   IndexedDB (sin dependencias externas)
Build:     Docker multi-etapa
Servidor:  Nginx stable-alpine
Seguridad: HTTPS + Service Workers
```

### Estructura del Proyecto

```
pwa-app/
├── src/
│   ├── components/
│   │   ├── TaskForm.tsx      # Formulario para crear tareas
│   │   ├── TaskManager.tsx   # Lista de tareas
│   │   └── *.css             # Estilos
│   ├── contexts/
│   │   └── TaskContext.tsx   # Context API para estado
│   ├── hooks/
│   │   └── useIndexedDB.ts   # Hook para IndexedDB
│   ├── sw.ts                 # Service Worker
│   ├── App.tsx               # App principal
│   └── main.tsx              # Entry + registro de SW
├── public/
│   ├── manifest.json         # Web App Manifest
│   └── icon-*.png            # Íconos PWA
├── Dockerfile                # Build multi-etapa
├── nginx.conf                # Configuración Nginx
└── DEPLOYMENT.md             # Guía de despliegue
```

### Cómo Funciona IndexedDB

```typescript
const useIndexedDB = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const addTask = async (title: string) => {
    const db = await initDB();
    const transaction = db.transaction('tasks', 'readwrite');
    const store = transaction.objectStore('tasks');
    await store.add(newTask);
  };
  
  // Persiste en el navegador, sobrevive offline
};
```

---

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Acceder a http://localhost:5173
```

### Build para Producción

```bash
# Compilar
npm run build

# Previsualizar
npm run preview
```

### Docker (Recomendado)

```bash
# Construir imagen
docker build -t pwa-task-manager:latest .

# Ejecutar
docker run -p 80:80 -p 443:443 pwa-task-manager:latest

# O con Docker Compose
docker-compose up -d
```

---

## 🐳 Despliegue en IONOS

### Pasos Básicos

1. **Obtener Certificado SSL**
```bash
sudo certbot certonly --standalone -d tu-dominio.com
```

2. **Copiar Certificados**
```bash
mkdir -p ssl
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ssl/key.pem
```

3. **Desplegar**
```bash
docker-compose up -d
```

4. **Verificar**
```bash
curl https://tu-dominio.com
```

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones completas.

---

## ✅ Verificar que es PWA

### En Chrome DevTools

1. Abre Chrome DevTools (F12)
2. Ve a **Lighthouse**
3. Haz clic **"Analyze page load"**
4. Verifica:
   - ✅ **Installable** (debe estar verde)
   - ✅ **Works offline** (debe estar verde)
   - 🔒 **HTTPS válido** (candado verde en URL)

### Instalar en Móvil

1. Abre la URL en Chrome mobile
2. Busca el botón **"Instalar"** (varía por navegador)
3. La app aparecerá en pantalla de inicio
4. Funciona offline con datos locales

---

## 📚 Documentación Adicional

- [QUICKSTART.md](./QUICKSTART.md) - Guía rápida de inicio
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Despliegue en IONOS
- [README_PWA.md](./README_PWA.md) - Investigación teórica detallada

---

## 🔗 Referencias Técnicas

- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Workers API](https://w3c.github.io/ServiceWorker/)
- [Caching Strategies - Jake Archibald](https://jakearchibald.com/2014/offline-cookbook/)
- [Google Web.dev PWA](https://web.dev/progressive-web-apps/)

---

## 📝 Licencia

MIT - Libre para uso educativo y comercial

---

## 👤 Información

**Institución**: Universidad Tecnológica de Tijuana  
**Materia**: Desarrollo Web Profesional  
**Docente**: Mike Cardona (@mikecardona076)  
**Desarrollo**: [Tu Nombre]  
**Fecha**: Febrero 2026  
**Versión**: 1.0.0
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

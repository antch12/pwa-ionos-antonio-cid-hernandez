# PWA Task Manager - Investigación, Implementación y Despliegue

Aplicación Web Progresiva (PWA) desarrollada con React, TypeScript y Vite. Desplegada en Docker con Nginx y certificados SSL en IONOS.

---

## 🔍 Parte 1: Investigación Teórica

### 1. Web App Manifest (manifest.json)

El **Web App Manifest** es un archivo JSON que describe metadatos sobre la aplicación web. Define cómo se comporta la PWA cuando se instala en el dispositivo del usuario.

#### Propiedades Clave:

**theme_color**: Define el color del tema que se aplica a la barra de direcciones y elementos de la interfaz del navegador. Afecta la experiencia visual cuando la app está en el escritorio.

**background_color**: Color de fondo mostrado mientras se cargan los recursos. Crítico para la experiencia UX durante el tiempo de inicialización para evitar "fondo blanco" innecesario.

**display**: Controla cómo se muestra la aplicación:
- `standalone`: Se ejecuta como una app nativa sin barras del navegador (preferida para PWA)
- `fullscreen`: Ocupa toda la pantalla sin interfaz del navegador
- `minimal-ui`: Muestra una barra de herramientas mínima
- `browser`: Se abre en una pestaña del navegador tradicional

**icons**: Array de objetos con información de iconos para diferentes dispositivos. Los navegadores seleccionan el icono más apropiado según contexto:
```json
{
  "src": "/icon-192.png",
  "sizes": "192x192",
  "type": "image/png",
  "purpose": "any"
}
```
Es crítico incluir múltiples tamaños (192x192, 512x512 mínimo) para garantizar claridad en todos los dispositivos.

#### Impacto Técnico:

El manifest.json es **obligatorio** para que un navegador reconozca la aplicación como instalable. Sin él, nunca aparecerá el prompt de instalación.

---

### 2. Service Workers

Los **Service Workers** son scripts JavaScript que actúan como intermediarios entre la aplicación y la red, permitiendo funcionalidad offline.

#### Ciclo de Vida:

1. **Installation (Instalación)**: Se ejecuta una sola vez al registrar el SW. Ideal para precachear recursos críticos.

2. **Activation (Activación)**: Se ejecuta después de la instalación. Limpia cachés obsoletos.

3. **Fetching (Intercepción)**: Intercepta solicitudes HTTP y aplica estrategias de caché.

#### Mecanismo de Proxy de Red:

Los Service Workers actúan como **middlewares** entre la app y la red:

```
Solicitud de App → Service Worker → Caché o Red → Respuesta
```

El Service Worker decide si devolver la respuesta del caché, hacer una solicitud de red, o aplicar fallbacks.

---

### 3. Estrategias de Almacenamiento (Caching)

#### **Cache First** (Assets Estáticos)
- Busca primero en caché
- Si no existe, realiza solicitud de red
- **Ventaja**: Máxima velocidad offline
- **Caso ideal**: CSS, JS, imágenes

#### **Network First** (APIs Dinámicas)
- Intenta red primero
- Si falla, devuelve caché
- **Ventaja**: Datos siempre frescos cuando hay conexión
- **Caso ideal**: APIs, datos de usuario

#### **Stale-While-Revalidate** (Feeds)
- Devuelve caché inmediatamente
- Actualiza en background sin esperar
- **Ventaja**: Mejor UX (rápido + actualización eventual)
- **Caso ideal**: Feeds, artículos

---

### 4. Seguridad y TLS

#### ¿Por qué HTTPS es Obligatorio para Service Workers?

1. **Prevención de MITM**: Sin HTTPS, un atacante podría inyectar un SW malicioso
2. **Confianza de Certificado**: Solo confiar en código que viene de servidor seguro
3. **Especificación W3C**: Los navegadores **rechazan SWs en HTTP**

#### Impacto del Certificado SSL en el "Install Prompt"

El navegador requiere:
- ✅ HTTPS válido con certificado no expirado
- ✅ Candado verde en barra de direcciones
- ✅ manifest.json válido
- ✅ Service Worker registrado

Si cualquiera falla → **No aparece el prompt de instalación**.

---

## 🛠 Parte 2: Implementación Técnica

### Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Estado**: Context API + Hooks
- **Persistencia**: IndexedDB
- **Contenedorización**: Docker multi-etapa
- **Servidor**: Nginx stable-alpine
- **Certificados**: Let's Encrypt (IONOS)

### Funcionalidades

✅ CRUD de tareas (Crear, leer, actualizar, eliminar)
✅ Persistencia en IndexedDB (no se pierden datos)
✅ Funcionalidad offline con Service Worker
✅ Instalable en pantalla de inicio
✅ Interfaz responsive (mobile-first)
✅ HTTPS con certificado válido

---

## 🐳 Dockerización

### Multi-Stage Build

**Etapa 1 (Build)**: node:alpine compila el proyecto
**Etapa 2 (Production)**: nginx:stable-alpine sirve archivos estáticos

**Ventajas**:
- Imagen final pequeña (apenas ~50MB vs 400MB+)
- No incluye dependencias de build
- Producción segura y optimizada

### Nginx Configuration

```nginx
server {
  listen 443 ssl http2;
  server_name example.com;
  
  ssl_certificate /etc/ssl/certs/cert.pem;
  ssl_certificate_key /etc/ssl/private/key.pem;
  
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}

# Redirigir HTTP → HTTPS
server {
  listen 80;
  server_name example.com;
  return 301 https://$server_name$request_uri;
}
```

---

## 🚀 Despliegue en IONOS

1. **Certificado SSL**: Usar Certbot + Let's Encrypt
2. **Docker Build**: Construir imagen multi-etapa
3. **Docker Run**: Exponer puerto 443 con volumen SSL
4. **Verificar**: Lighthouse → PWA Audit

### Verificación de Instalabilidad

En Chrome DevTools (F12):
- Lighthouse → Run Audit
- ✅ "Installable" (verde)
- ✅ "Works offline" (verde)
- 🔒 Candado verde en URL

---

## 📝 Referencias Técnicas

- [MDN Web Docs - PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Workers](https://w3c.github.io/ServiceWorker/)
- [Caching Strategies](https://jakearchibald.com/2014/offline-cookbook/)

---

**Institución**: Universidad Tecnológica de Tijuana  
**Docente**: Mike Cardona (@mikecardona076)  
**Tecnologías**: React + TypeScript + Vite + Docker  
**Seguridad**: HTTPS + Service Workers + IndexedDB  

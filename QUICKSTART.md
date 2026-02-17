# Quick Start - PWA Task Manager

## 🚀 Inicio Rápido

### 1. Instalación Local (Desarrollo)

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo (hot reload)
npm run dev

# Ir a http://localhost:5173
```

### 2. Build para Producción

```bash
# Compilar
npm run build

# Previsualizar build
npm run preview
```

### 3. Generar Iconos PWA

#### En Windows (PowerShell):
```powershell
# Requiere ImageMagick instalado
.\scripts\generate-icons.ps1
```

#### En Linux/Mac (Bash):
```bash
# Requiere ImageMagick instalado
bash scripts/generate-icons.sh
```

### 4. Build Docker Local

```bash
# Construir imagen
docker build -t pwa-task-manager:latest .

# Ejecutar contenedor
docker run -p 80:80 -p 443:443 pwa-task-manager:latest
```

### 5. Docker Compose (Recomendado)

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 📁 Estructura del Proyecto

```
pwa-app/
├── src/
│   ├── components/       # Componentes React
│   │   ├── TaskForm.tsx
│   │   ├── TaskManager.tsx
│   │   └── *.css
│   ├── contexts/         # Context API
│   │   └── TaskContext.tsx
│   ├── hooks/            # Hooks personalizados
│   │   └── useIndexedDB.ts
│   ├── sw.ts             # Service Worker
│   ├── App.tsx
│   ├── main.tsx          # Entry point con SW registration
│   └── index.css
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-192-maskable.png
├── Dockerfile            # Build multi-etapa
├── docker-compose.yml
├── nginx.conf            # Configuración Nginx
├── vite.config.ts
├── tsconfig.json
├── package.json
├── DEPLOYMENT.md         # Guía de despliegue IONOS
└── README_PWA.md         # Investigación teórica

```

## ✨ Funcionalidades

- ✅ CRUD de tareas completo
- ✅ Persistencia en IndexedDB
- ✅ Funcionalidad offline
- ✅ Instalable en pantalla de inicio
- ✅ Responsive (mobile-first)
- ✅ Service Workers con múltiples estrategias de caché
- ✅ HTTPS con certificados SSL
- ✅ Lighthouse PWA compliant

## 🔍 Verificar PWA

1. Abre la aplicación en Chrome
2. Presiona F12 (DevTools)
3. Ve a "Lighthouse"
4. Haz clic "Analyze page load"
5. Verifica:
   - ✅ Installable (verde)
   - ✅ Works offline (verde)
   - 🔒 HTTPS válido

## 🐳 Desplegar en IONOS

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones completas.

Resumido:
```bash
# 1. Obtener certificado SSL (Let's Encrypt)
sudo certbot certonly --standalone -d tu-dominio.com

# 2. Copiar certificados
mkdir -p ssl
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ssl/key.pem

# 3. Ejecutar con Docker Compose
docker-compose up -d

# 4. Verificar
curl https://tu-dominio.com
```

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run preview` | Previsualizar build |
| `npm run lint` | Ejecutar ESLint |
| `npm run build:docker` | Construir imagen Docker |

## 📚 Documentación

- [README_PWA.md](./README_PWA.md) - Investigación teórica detallada
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue en IONOS
- [MDN PWA Docs](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

## 🐛 Solución de Problemas

### El Service Worker no se registra
- Verifica que estés usando HTTPS (o localhost)
- Revisa la consola del navegador en DevTools
- Comprueba que `/sw.js` sea accesible

### Los datos no persisten
- Verifica que IndexedDB esté habilitado
- Revisa el manejador de errores en useIndexedDB.ts
- Comprueba permisos de almacenamiento en el navegador

### Docker no inicia
```bash
docker-compose logs pwa
```

### Certificado SSL invalido
```bash
openssl x509 -in ssl/cert.pem -noout -dates
```

## 📞 Soporte

Para problemas específicos:
- Verifica los logs con `docker-compose logs -f`
- Abre DevTools (F12) para errores de cliente
- Revisa el archivo nginx.conf si hay problemas de servidor

## 📝 Notas Importantes

- Los datos se guardan en IndexedDB (del navegador), no en servidor
- Cada navegador/dispositivo tiene su propia instancia de datos
- El Service Worker cachea recursos automáticamente
- HTTPS es obligatorio para todos los Service Workers

## 🎯 Próximos Pasos

1. Generar iconos PWA de alta calidad
2. Crear screenshot para App Store
3. Configurar dominios en IONOS
4. Obtener certificado SSL
5. Desplegar en servidor IONOS
6. Verificar con Lighthouse
7. Testar instalación en móviles
8. Enviar enlace al docente

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0  
**Licencia**: MIT

# Guía de Despliegue en IONOS

Este documento proporciona pasos detallados para desplegar la PWA Task Manager en un servidor IONOS con Docker y HTTPS.

---

## 📋 Requisitos Previos

- Servidor Linux/Ubuntu en IONOS (preferiblemente Ubuntu 22.04 LTS o superior)
- Acceso SSH a tu servidor IONOS
- Dominio configurado en IONOS (DNS apuntando a la IP del servidor)
- Git instalado en el servidor
- Docker y Docker Compose instalados

---

## 🔧 Instalación de Docker en IONOS

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version

# Agregar tu usuario al grupo docker (opcional)
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🔐 Obtener Certificado SSL con Let's Encrypt

### Opción 1: Certbot (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot -y

# Generar certificado (reemplazar con tu dominio)
sudo certbot certonly --standalone -d tu-dominio.com

# Los certificados se guardarán en:
# /etc/letsencrypt/live/tu-dominio.com/

# Copiar certificados al directorio del proyecto
mkdir -p ~/pwa-app/ssl
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ~/pwa-app/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ~/pwa-app/ssl/key.pem
sudo chown $USER:$USER ~/pwa-app/ssl/*.pem
```

### Opción 2: Usar Certificado de IONOS

Si IONOS te proporciona certificados:
```bash
# Crear directorio para certificados
mkdir -p ~/pwa-app/ssl

# Copiar tus certificados
cp tu-cert.crt ~/pwa-app/ssl/cert.pem
cp tu-key.key ~/pwa-app/ssl/key.pem
```

---

## 📦 Clonar y Configurar el Proyecto

```bash
# Cambiar al directorio home
cd ~

# Clonar el repositorio
git clone https://github.com/tu-usuario/pwa-ionos-tu-nombre.git
cd pwa-ionos-tu-nombre

# Instalar dependencias localmente (opcional, Docker lo hace)
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env
# Editar las variables según tu configuración
```

---

## 🐳 Construir y Ejecutar con Docker

```bash
# Construir la imagen Docker
docker build -t pwa-task-manager:latest .

# Verificar que la imagen se construyó correctamente
docker images | grep pwa-task-manager

# Ejecutar con Docker Compose (recomendado)
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver estado de contenedores
docker-compose ps

# Detener contenedores
docker-compose down
```

---

## 🌐 Configuración del Firewall

```bash
# Permitir tráfico HTTP (puerto 80)
sudo ufw allow 80/tcp

# Permitir tráfico HTTPS (puerto 443)
sudo ufw allow 443/tcp

# Permitir SSH (puerto 22)
sudo ufw allow 22/tcp

# Habilitar firewall
sudo ufw enable

# Ver reglas activas
sudo ufw status
```

---

## 🔄 Renovación Automática de Certificados

Para renovar certificados automáticamente con Let's Encrypt:

```bash
# Crear script de renovación
sudo nano /usr/local/bin/renew-certs.sh
```

Agregar este contenido:

```bash
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem ~/pwa-app/ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem ~/pwa-app/ssl/key.pem
docker-compose -f ~/pwa-app/docker-compose.yml restart pwa
```

Hacer ejecutable y agregar a cron:

```bash
sudo chmod +x /usr/local/bin/renew-certs.sh

# Editar crontab
sudo crontab -e

# Agregar esta línea para ejecutar diariamente a las 2 AM
0 2 * * * /usr/local/bin/renew-certs.sh >> /var/log/cert-renewal.log 2>&1
```

---

## ✅ Verificar que la PWA Está Funcionando

### Verificar con curl

```bash
# HTTP redirige a HTTPS
curl -I http://tu-dominio.com

# HTTPS con certificado válido
curl -I https://tu-dominio.com

# Ver contenido de index.html
curl https://tu-dominio.com
```

### Verificar en el navegador

1. Abre `https://tu-dominio.com` en Chrome
2. Verifica que no haya errores de certificado (debe ver 🔒)
3. Abre DevTools (F12)
4. Da a Lighthouse → Run Audit
5. Busca:
   - ✅ "Installable"
   - ✅ "Works offline"
   - 🔒 Certificado válido

---

## 📊 Monitoreo y Mantenimiento

```bash
# Ver logs de Nginx
docker exec pwa-task-manager tail -f /var/log/nginx/access.log

# Ver uso de recursos
docker stats pwa-task-manager

# Ejecutar comandos dentro del contenedor
docker exec -it pwa-task-manager /bin/sh

# Hacer backup de la base de datos (si aplica)
docker exec pwa-task-manager cp -r /data /backup/

# Limpiar imágenes y contenedores no utilizados
docker image prune -a
docker container prune
```

---

## 🆘 Solución de Problemas

### El puerto 80/443 ya está en uso

```bash
# Encontrar proceso usando el puerto
sudo lsof -i :80
sudo lsof -i :443

# Matar el proceso
sudo kill -9 <PID>
```

### Certificado SSL inválido

```bash
# Verificar fecha de expiración
openssl x509 -in ~/pwa-app/ssl/cert.pem -noout -dates

# Renovar certificado
sudo certbot renew --force-renewal
```

### Contenedor no inicia

```bash
# Ver logs de error
docker-compose logs pwa

# Reiniciar Docker daemon
sudo systemctl restart docker

# Reconstruir imagen
docker-compose build --no-cache
docker-compose up -d
```

### Permisos de certificados

```bash
# Asegurar permisos correctos
sudo chmod 644 ~/pwa-app/ssl/cert.pem
sudo chmod 644 ~/pwa-app/ssl/key.pem
sudo chown nobody:nogroup ~/pwa-app/ssl/*.pem
```

---

## 📝 Variables de Entorno Importantes

- `DOMAIN`: Tu dominio IONOS
- `SSL_CERT_PATH`: Ruta al certificado
- `SSL_KEY_PATH`: Ruta a la clave privada
- `TZ`: Zona horaria del servidor
- `NODE_ENV`: Siempre "production" en IONOS

---

## 🔗 Referencias Útiles

- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**Última actualización**: Febrero 2026  
**Desplegado en**: IONOS Cloud Server

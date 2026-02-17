#!/bin/bash

# Script para generar iconos PWA usando ImageMagick
# Instalar: sudo apt-get install imagemagick

PUBLIC_DIR="./public"

echo "📦 Generando iconos PWA..."

# Crear directorio si no existe
mkdir -p "$PUBLIC_DIR"

# Generar icono base 512x512
echo "Creando icono 512x512..."
convert -size 512x512 xc:'#1976d2' \
  -font Arial-Bold -pointsize 200 -fill white \
  -gravity center -annotate +0+0 '✓' \
  "$PUBLIC_DIR/icon-512.png"

# Redimensionar a 192x192
echo "Creando icono 192x192..."
convert "$PUBLIC_DIR/icon-512.png" -resize 192x192 "$PUBLIC_DIR/icon-192.png"

# Crear versión maskable (para algunos navegadores)
echo "Creando icono maskable 192x192..."
convert "$PUBLIC_DIR/icon-512.png" -resize 192x192 "$PUBLIC_DIR/icon-192-maskable.png"

# Crear screenshots para App Store
echo "Creando screenshots..."
convert -size 1280x720 xc:white \
  -font Arial -pointsize 60 -fill '#1976d2' \
  -gravity center -annotate +0+0 "📋 Task Manager PWA" \
  "$PUBLIC_DIR/screenshot-1280x720.png"

convert -size 540x720 xc:white \
  -font Arial -pointsize 40 -fill '#1976d2' \
  -gravity center -annotate +0+0 "📋 Task Manager PWA" \
  "$PUBLIC_DIR/screenshot-540x720.png"

echo "✅ Iconos generados exitosamente en $PUBLIC_DIR"
echo ""
echo "Archivos creados:"
ls -lh "$PUBLIC_DIR/icon-*.png" "$PUBLIC_DIR/screenshot-*.png" 2>/dev/null | awk '{print "  -", $9, "(" $5 ")"}'

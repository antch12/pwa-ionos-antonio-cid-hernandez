#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PNG from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear directorio public si no existe
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Función para crear un PNG con gradiente y checkmark
function createIcon(size, filename, isMaskable = false) {
  return new Promise((resolve) => {
    const png = new PNG.PNG({ width: size, height: size });

    // Rellenar con gradiente azul y dibujar checkmark
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (size * y + x) << 2;
        const ratio = (x + y) / (size * 2);
        
        // Gradiente: desde azul claro (#1976d2) a azul oscuro (#1565c0)
        png.data[idx] = Math.floor(25 + (21 - 25) * ratio);       // R: 25 -> 21
        png.data[idx + 1] = Math.floor(118 + (101 - 118) * ratio); // G: 118 -> 101
        png.data[idx + 2] = Math.floor(210 + (192 - 210) * ratio); // B: 210 -> 192
        png.data[idx + 3] = 255;                                    // A: opaco
      }
    }

    // Dibujar círculo blanco y checkmark
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 3.5;

    // Algoritmo de Bresenham para círculo
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          // Círculo blanco
          const idx = (size * y + x) << 2;
          png.data[idx] = 255;     // R
          png.data[idx + 1] = 255; // G
          png.data[idx + 2] = 255; // B
          png.data[idx + 3] = 255; // A
        }
      }
    }

    // Dibujar checkmark (✓) azul en el círculo
    const checkStartX = Math.floor(size / 3);
    const checkStartY = Math.floor(size / 2);
    const checkLength = Math.floor(size / 8);

    // Línea diagonal 1
    for (let i = 0; i < checkLength; i++) {
      const x = checkStartX + i;
      const y = checkStartY + i;
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (size * y + x) << 2;
        png.data[idx] = 25;     // R (azul oscuro)
        png.data[idx + 1] = 101; // G
        png.data[idx + 2] = 192; // B
      }
    }

    // Línea diagonal 2
    for (let i = 0; i < checkLength * 2; i++) {
      const x = checkStartX + checkLength + i;
      const y = checkStartY + checkLength - i;
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (size * y + x) << 2;
        png.data[idx] = 25;
        png.data[idx + 1] = 101;
        png.data[idx + 2] = 192;
      }
    }

    png.pack().pipe(fs.createWriteStream(path.join(publicDir, filename)))
      .on('finish', () => {
        console.log(`✅ Creado: ${filename} (${size}x${size})`);
        resolve();
      });
  });
}

// Crear los iconos
async function generateIcons() {
  console.log('🎨 Generando iconos PWA...\n');

  try {
    // Generar iconos PNG
    await createIcon(192, 'icon-192.png');
    await createIcon(512, 'icon-512.png');
    await createIcon(192, 'icon-192-maskable.png', true);

    // Crear screenshots como SVG (más ligeros)
    const screenshot540 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="540" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1565c0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="540" height="720" fill="url(#grad)"/>
  <circle cx="270" cy="200" r="60" fill="white"/>
  <text x="270" y="250" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">
    📋 Task Manager
  </text>
  <rect x="30" y="320" width="480" height="80" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="2"/>
  <rect x="30" y="430" width="480" height="80" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="2"/>
  <rect x="30" y="540" width="480" height="80" rx="8" fill="white" opacity="0.2" stroke="white" stroke-width="2"/>
</svg>`;

    fs.writeFileSync(path.join(publicDir, 'screenshot-540x720.png'), screenshot540);
    console.log(`✅ Creado: screenshot-540x720.png`);

    const screenshot1280 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1976d2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1565c0;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#grad)"/>
  <circle cx="640" cy="180" r="80" fill="white"/>
  <text x="640" y="340" font-size="72" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">
    PWA Task Manager
  </text>
  <text x="640" y="420" font-size="32" fill="white" text-anchor="middle" font-style="italic" opacity="0.9">
    Funciona sin conexión • Instálala como app
  </text>
</svg>`;

    fs.writeFileSync(path.join(publicDir, 'screenshot-1280x720.png'), screenshot1280);
    console.log(`✅ Creado: screenshot-1280x720.png`);

    console.log('\n✨ Todos los iconos generados correctamente');
    console.log('📦 Los archivos están en public/\n');
  } catch (err) {
    console.error('❌ Error al generar iconos:', err.message);
    process.exit(1);
  }
}

generateIcons();

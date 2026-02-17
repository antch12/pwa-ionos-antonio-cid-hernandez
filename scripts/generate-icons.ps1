# Script PowerShell para generar iconos PWA
# Requiere ImageMagick instalado en Windows

$PublicDir = "./public"
$IconColor = "#1976d2"
$IconSize = 512

Write-Host "📦 Generando iconos PWA..." -ForegroundColor Cyan

# Crear directorio si no existe
if (-not (Test-Path $PublicDir)) {
    New-Item -ItemType Directory -Path $PublicDir -Force | Out-Null
}

try {
    # Verificar si ImageMagick está instalado
    $magick = Get-Command convert -ErrorAction Stop
    Write-Host "✓ ImageMagick encontrado: $($magick.Source)" -ForegroundColor Green
} catch {
    Write-Host "❌ ImageMagick no está instalado." -ForegroundColor Red
    Write-Host "Descárgalo desde: https://imagemagick.org/script/download.php" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "O instala con Chocolatey:" -ForegroundColor Yellow
    Write-Host "  choco install imagemagick" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Como alternativa, puedes crear los archivos PNG manualmente o usar herramientas online." -ForegroundColor Yellow
    exit 1
}

# Generar icono base 512x512
Write-Host "Creando icono 512x512..." -ForegroundColor Yellow
convert -size 512x512 xc:$IconColor `
    -font "Arial" -pointsize 200 -fill white `
    -gravity center -annotate +0+0 "✓" `
    "$PublicDir/icon-512.png"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ icon-512.png creado" -ForegroundColor Green
}

# Redimensionar a 192x192
Write-Host "Creando icono 192x192..." -ForegroundColor Yellow
convert "$PublicDir/icon-512.png" -resize 192x192 "$PublicDir/icon-192.png"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ icon-192.png creado" -ForegroundColor Green
}

# Crear versión maskable
Write-Host "Creando icono maskable 192x192..." -ForegroundColor Yellow
copy "$PublicDir/icon-192.png" "$PublicDir/icon-192-maskable.png"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ icon-192-maskable.png creado" -ForegroundColor Green
}

# Crear screenshots
Write-Host "Creando screenshots..." -ForegroundColor Yellow
convert -size 1280x720 xc:white `
    -font "Arial" -pointsize 60 -fill $IconColor `
    -gravity center -annotate +0+0 "📋 Task Manager PWA" `
    "$PublicDir/screenshot-1280x720.png"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ screenshot-1280x720.png creado" -ForegroundColor Green
}

convert -size 540x720 xc:white `
    -font "Arial" -pointsize 40 -fill $IconColor `
    -gravity center -annotate +0+0 "📋 Task Manager`nPWA" `
    "$PublicDir/screenshot-540x720.png"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ screenshot-540x720.png creado" -ForegroundColor Green
}

# Mostrar resultados
Write-Host ""
Write-Host "✅ Iconos generados exitosamente en $PublicDir" -ForegroundColor Green
Write-Host ""
Write-Host "Archivos creados:" -ForegroundColor Cyan
Get-ChildItem "$PublicDir/icon-*.png", "$PublicDir/screenshot-*.png" -ErrorAction SilentlyContinue |
    ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "  - $($_.Name) ($size KB)" -ForegroundColor Gray
    }

Write-Host ""
Write-Host "💡 Tip: Reemplaza estos iconos con versiones de mejor calidad para producción" -ForegroundColor Yellow

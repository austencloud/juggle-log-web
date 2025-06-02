#!/usr/bin/env pwsh
# 🪄 F5 MAGICAL Developer Experience Script
# Optimized for Windows development workflow with enhanced UX

param(
    [switch]$Clean,
    [switch]$Debug,
    [switch]$Test,
    [switch]$Full,
    [switch]$Turbo,
    [switch]$Magic
)

# Set console encoding for emojis
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Clear-Host
Write-Host "🪄✨ MAGICAL F5 DEVELOPER EXPERIENCE ✨🪄" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta
Write-Host ""

# Enhanced ASCII art for magic mode
if ($Magic -or $Turbo) {
    Write-Host "    ╔═══════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "    ║          🎪 JUGGLE LOG 🎪          ║" -ForegroundColor Cyan  
    Write-Host "    ║        TURBO MAGIC MODE 🚀        ║" -ForegroundColor Cyan
    Write-Host "    ╚═══════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# Performance timer
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

# Check system readiness
Write-Host "🔍 System Readiness Check..." -ForegroundColor Yellow

# Check Node.js version
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found! Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies with turbo speed..." -ForegroundColor Yellow
    $installStart = Get-Date
    npm install --silent
    $installTime = ((Get-Date) - $installStart).TotalSeconds
    Write-Host "   ✅ Dependencies installed in $([math]::Round($installTime, 1))s" -ForegroundColor Green
} else {
    Write-Host "   ✅ Dependencies ready" -ForegroundColor Green
}

# Clean build if requested
if ($Clean -or $Turbo) {
    Write-Host "🧹 Magical cleanup in progress..." -ForegroundColor Yellow
    
    $cleanItems = @(
        ".svelte-kit",
        "node_modules/.vite", 
        "dist",
        ".DS_Store",
        "Thumbs.db"
    )
    
    foreach ($item in $cleanItems) {
        if (Test-Path $item) {
            Remove-Item -Recurse -Force $item -ErrorAction SilentlyContinue
            Write-Host "   🗑️  Removed $item" -ForegroundColor Gray
        }
    }
    Write-Host "   ✨ Workspace sparkles with cleanliness!" -ForegroundColor Green
}

# Enhanced type checking
$typeCheckJob = $null
if ($Full -or $Magic) {
    Write-Host "🔍 Starting magical type checking..." -ForegroundColor Green
    $typeCheckJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run check:watch 2>&1 | Out-Null
    }
    Write-Host "   🔮 Type checker running in background" -ForegroundColor Cyan
}

# Run tests if requested
if ($Test) {
    Write-Host "🧪 Running test suite..." -ForegroundColor Green
    $testStart = Get-Date
    $testResult = npm run test:run
    $testTime = ((Get-Date) - $testStart).TotalSeconds
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ All tests passed in $([math]::Round($testTime, 1))s" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Some tests failed - check output above" -ForegroundColor Yellow
    }
}

# Display enhanced keyboard shortcuts
Write-Host ""
Write-Host "⌨️  🪄 MAGICAL KEYBOARD SHORTCUTS 🪄" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "   F5              ✨ Magical page refresh with preloading" -ForegroundColor White
Write-Host "   Ctrl+Shift+R    🔄 Nuclear refresh (clear all caches)" -ForegroundColor White
Write-Host "   Ctrl+Shift+D    🐛 Toggle debug mode with visual indicators" -ForegroundColor White
Write-Host "   Ctrl+Shift+L    🧹 Clear development console logs" -ForegroundColor White
Write-Host "   F12             📋 Toggle development overlay panel" -ForegroundColor White
Write-Host ""
Write-Host "🎯 DEVELOPMENT FEATURES:" -ForegroundColor Cyan
Write-Host "   • Instant HMR with visual feedback" -ForegroundColor Gray
Write-Host "   • Smart preloading of critical resources" -ForegroundColor Gray
Write-Host "   • Magical loading animations" -ForegroundColor Gray
Write-Host "   • Enhanced error boundaries" -ForegroundColor Gray
Write-Host "   • Route prefetching for instant navigation" -ForegroundColor Gray
Write-Host ""

# Determine server command
$serverArgs = @("run")
if ($Magic -or $Turbo) {
    $serverArgs += "dev:magic"
} elseif ($Debug) {
    $serverArgs += "dev:debug"
} else {
    $serverArgs += "dev"
}

# Enhanced server startup
Write-Host "🚀 Launching magical development server..." -ForegroundColor Green

# Get local IP for network access
try {
    $localIP = (Get-NetIPConfiguration | Where-Object {$_.IPv4DefaultGateway -ne $null}).IPv4Address.IPAddress | Select-Object -First 1
} catch {
    $localIP = "localhost"
}

$setupTime = $stopwatch.Elapsed.TotalSeconds
Write-Host ""
Write-Host "🌐 SERVER ENDPOINTS:" -ForegroundColor Cyan
Write-Host "   🏠 Local:    http://localhost:9000" -ForegroundColor White
Write-Host "   🌍 Network:  http://${localIP}:9000" -ForegroundColor White
Write-Host "   ⚡ Setup completed in $([math]::Round($setupTime, 1))s" -ForegroundColor Green
Write-Host ""
Write-Host "🎭 Press F5 in your browser to experience the magic!" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Start server with enhanced error handling
try {
    # Open browser automatically in magic/turbo mode
    if ($Magic -or $Turbo) {
        Start-Process "http://localhost:9000"
        Start-Sleep -Milliseconds 500
    }
    
    npm @serverArgs
} catch {
    Write-Host ""
    Write-Host "❌ MAGICAL POWERS FAILED!" -ForegroundColor Red
    Write-Host "   The development server couldn't start." -ForegroundColor Red
    Write-Host "   Check the error above and try again." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Quick fixes to try:" -ForegroundColor Yellow
    Write-Host "   • Run: npm install" -ForegroundColor White
    Write-Host "   • Run: .\dev.ps1 -Clean" -ForegroundColor White
    Write-Host "   • Check if port 9000 is already in use" -ForegroundColor White
    exit 1
} finally {
    # Cleanup
    if ($typeCheckJob) {
        Write-Host ""
        Write-Host "🧹 Cleaning up background processes..." -ForegroundColor Yellow
        Stop-Job $typeCheckJob -ErrorAction SilentlyContinue
        Remove-Job $typeCheckJob -ErrorAction SilentlyContinue
        Write-Host "   ✅ Cleanup complete" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "👋 Thanks for using the magical F5 experience!" -ForegroundColor Magenta
    Write-Host "   Total session time: $([math]::Round($stopwatch.Elapsed.TotalMinutes, 1)) minutes" -ForegroundColor Gray
}
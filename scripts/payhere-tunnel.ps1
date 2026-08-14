# Expose the Nest API so PayHere sandbox can POST the payment notify webhook.
# Quick tunnels get a new trycloudflare.com URL each run — paste it into PAYHERE_DOMAIN.
#
# Usage (PowerShell), with the backend already on port 9000:
#   .\scripts\payhere-tunnel.ps1
#
# Docs: https://developers.cloudflare.com/tunnel/setup/

$ErrorActionPreference = "Stop"
$port = if ($env:PORT) { $env:PORT } else { "9000" }
$url = "http://localhost:$port"

$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
  $defaultPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
  if (Test-Path $defaultPath) {
    $cloudflared = Get-Command $defaultPath
  } else {
    throw "cloudflared not found. Install: winget install --id Cloudflare.cloudflared"
  }
}

Write-Host "Starting Cloudflare quick tunnel -> $url"
Write-Host "Copy the https://....trycloudflare.com URL into apps/backend/.env as PAYHERE_DOMAIN"
Write-Host "Then restart the backend. In PayHere sandbox, allow domain: trycloudflare.com"
Write-Host ""

& $cloudflared.Source tunnel --url $url

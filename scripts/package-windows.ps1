param(
  [string]$OutputDirectory = 'output/windows-portable'
)

$ErrorActionPreference = 'Stop'

Write-Output 'Building the web game...'
npm run build

Write-Output 'Building the portable Windows executable...'
npx -y electron-builder@26.0.12 --win portable --x64 --config.electronVersion=36.4.0 --config.directories.output=$OutputDirectory

$exe = Get-ChildItem -LiteralPath $OutputDirectory -Filter '*.exe' -File | Select-Object -First 1
if (-not $exe) {
  throw "Portable Windows executable was not created in $OutputDirectory"
}

Write-Output $exe.FullName

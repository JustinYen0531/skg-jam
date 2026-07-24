param(
  [string]$SourceDirectory = 'dist',
  [string]$DestinationPath = 'output/Game-Questing-Questioning-Game-itchio-READY.zip'
)

$ErrorActionPreference = 'Stop'

$sourceRoot = (Resolve-Path -LiteralPath $SourceDirectory).Path
$destination = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $DestinationPath))

if (Test-Path -LiteralPath $destination) {
  throw "Refusing to overwrite existing package: $destination"
}

$destinationDirectory = Split-Path -Parent $destination
if (-not (Test-Path -LiteralPath $destinationDirectory)) {
  New-Item -ItemType Directory -Path $destinationDirectory | Out-Null
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$stream = [System.IO.File]::Open($destination, [System.IO.FileMode]::CreateNew)
$archive = [System.IO.Compression.ZipArchive]::new(
  $stream,
  [System.IO.Compression.ZipArchiveMode]::Create,
  $false
)

try {
  Get-ChildItem -LiteralPath $sourceRoot -Recurse -File | ForEach-Object {
    $entryName = $_.FullName.Substring($sourceRoot.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $archive,
      $_.FullName,
      $entryName,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
} finally {
  $archive.Dispose()
  $stream.Dispose()
}

Write-Output $destination

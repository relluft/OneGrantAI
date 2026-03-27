$zipFile = "OneGRANT_Submission.zip"
$excludeList = @(
    "node_modules",
    "venv",
    ".venv",
    ".env",
    ".git",
    "dist",
    ".idea",
    ".vscode",
    ".cursor",
    "OneGRANT_Submission.zip",
    "package_submission.ps1"
)

# Remove existing zip if any
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

$itemsToZip = Get-ChildItem -Path . -Exclude $excludeList

Write-Host "Creating $zipFile..." -ForegroundColor Cyan
Compress-Archive -Path $itemsToZip -DestinationPath $zipFile -Force

Write-Host "Done! ZIP created: $zipFile" -ForegroundColor Green
$size = (Get-Item $zipFile).Length / 1MB
Write-Host "Size: $('{0:N2}' -f $size) MB" -ForegroundColor Yellow

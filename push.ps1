param(
    [string]$Message = ""
)

if ($Message -eq "") {
    $Message = Read-Host "Commit message"
}

if ($Message -eq "") {
    Write-Host "Commit message cannot be empty." -ForegroundColor Red
    exit 1
}

git add -A
git commit -m $Message
git push origin main

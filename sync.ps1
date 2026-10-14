# Hexense Labs SCMS - Git and Lovable Two-Way Synchronization Script
param(
    [Parameter(Position=0)]
    [ValidateSet('status', 'pull', 'push', 'setup', 'help')]
    [string]$Action = 'status',

    [Parameter(Position=1)]
    [string]$Message = 'Auto-sync update from local offline workspace'
)

$ErrorActionPreference = 'Stop'

function Show-Header {
    Write-Host '==========================================================' -ForegroundColor Cyan
    Write-Host '  Hexense Labs SCMS -- GitHub / Lovable Sync Manager      ' -ForegroundColor White
    Write-Host '==========================================================' -ForegroundColor Cyan
}

function Check-Git {
    try {
        $v = git --version
        Write-Host "Git detected: $v" -ForegroundColor Green
    } catch {
        Write-Host 'Git is not found in PATH. Adding user Git path...' -ForegroundColor Yellow
        $env:PATH = "$env:LOCALAPPDATA\Programs\Git\cmd;$env:PATH"
        git --version
    }
}

Show-Header
Check-Git

switch ($Action) {
    'status' {
        Write-Host "`n[Git Status]" -ForegroundColor Yellow
        git status
        Write-Host "`n[Remote Repositories]" -ForegroundColor Yellow
        git remote -v
    }
    'pull' {
        Write-Host "`nPulling latest changes from GitHub (and Lovable)..." -ForegroundColor Cyan
        git pull origin main
        Write-Host 'Sync pull complete!' -ForegroundColor Green
    }
    'push' {
        Write-Host "`nStaging all local files and documentation..." -ForegroundColor Cyan
        git add .
        $status = git status --porcelain
        if ([string]::IsNullOrWhiteSpace($status)) {
            Write-Host 'No local changes to commit.' -ForegroundColor Yellow
        } else {
            Write-Host "Committing changes with message: '$Message'..." -ForegroundColor Cyan
            git commit -m "$Message"
            Write-Host 'Pushing to GitHub (this will auto-trigger sync in Lovable)...' -ForegroundColor Cyan
            git push origin main
            Write-Host 'Sync push complete! GitHub and Lovable are updated.' -ForegroundColor Green
        }
    }
    'setup' {
        Write-Host "`n[First-Time Setup Helper]" -ForegroundColor Cyan
        Write-Host 'Enter your GitHub repository URL (e.g. https://github.com/username/hexense-scms.git):' -ForegroundColor Yellow
        $repoUrl = Read-Host 'Repository URL'
        if (![string]::IsNullOrWhiteSpace($repoUrl)) {
            if (!(Test-Path '.git')) {
                git init
                git branch -M main
            }
            $existingRemote = git remote
            if ($existingRemote -contains 'origin') {
                git remote set-url origin $repoUrl
            } else {
                git remote add origin $repoUrl
            }
            Write-Host "Remote origin configured to: $repoUrl" -ForegroundColor Green
            Write-Host "Run '.\sync.ps1 push' to upload your local files to GitHub." -ForegroundColor Green
        }
    }
    'help' {
        Write-Host "`nUsage:" -ForegroundColor Yellow
        Write-Host '  .\sync.ps1 status            - Check local changes and remote status'
        Write-Host '  .\sync.ps1 pull              - Pull latest updates from GitHub and Lovable'
        Write-Host '  .\sync.ps1 push [message]    - Commit and push offline changes to GitHub and Lovable'
        Write-Host '  .\sync.ps1 setup             - Link this folder to your GitHub repository'
    }
}

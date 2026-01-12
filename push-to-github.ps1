# PowerShell script to push to GitHub while preserving ALL existing commit history
# This script will preserve your ~20 existing commits and add new commits on top

Write-Host "Setting up Git repository and pushing to GitHub..." -ForegroundColor Green
Write-Host "This will preserve ALL existing commits and add new ones on top." -ForegroundColor Cyan

# Navigate to project directory
$projectPath = "C:\Users\niraj\OneDrive\Desktop\Easy Buy"
Set-Location $projectPath

# Try to find Git in common installation paths
$gitPaths = @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
    "$env:ProgramFiles\Git\cmd\git.exe"
)

$gitFound = $false
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $gitDir = Split-Path (Split-Path $path)
        $env:Path = "$gitDir\cmd;$env:Path"
        $gitFound = $true
        Write-Host "Found Git at: $path" -ForegroundColor Green
        break
    }
}

# Check if git is available
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Git found: $gitVersion" -ForegroundColor Green
    } else {
        throw "Git not found"
    }
} catch {
    Write-Host "ERROR: Git is not found in PATH. Please install Git or add it to your PATH." -ForegroundColor Red
    Write-Host "Download Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart PowerShell and run this script again." -ForegroundColor Yellow
    exit 1
}

# Add remote (update if exists)
$remoteUrl = "https://github.com/nirajan124/Easy-buy.git"
Write-Host "Setting up remote repository..." -ForegroundColor Cyan

# Check if .git directory exists
if (Test-Path .git) {
    Write-Host "Git repository already initialized." -ForegroundColor Yellow
    # Update remote
    git remote remove origin 2>$null
    git remote add origin $remoteUrl
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    git remote add origin $remoteUrl
}

# Fetch existing history from GitHub (this preserves all existing commits)
Write-Host "Fetching existing commit history from GitHub..." -ForegroundColor Cyan
git fetch origin

# Check if there are existing commits on the remote
$remoteBranches = git ls-remote --heads origin 2>$null
$hasMainBranch = $remoteBranches -match "refs/heads/main"
$hasMasterBranch = $remoteBranches -match "refs/heads/master"

if ($hasMainBranch -or $hasMasterBranch) {
    $branchName = if ($hasMainBranch) { "main" } else { "master" }
    Write-Host "Found existing commits on GitHub ($branchName branch). Preserving ALL history..." -ForegroundColor Green
    
    # Show existing commit count
    $commitCount = (git rev-list --count origin/$branchName 2>$null)
    if ($commitCount) {
        Write-Host "Found $commitCount existing commits. These will be preserved." -ForegroundColor Green
    }
    
    # Checkout the existing branch to preserve all commits
    Write-Host "Checking out existing branch to preserve commit history..." -ForegroundColor Cyan
    git checkout -b $branchName origin/$branchName 2>$null
    if ($LASTEXITCODE -ne 0) {
        # If checkout fails, try creating new branch and merging
        Write-Host "Creating local branch and merging remote history..." -ForegroundColor Cyan
        git checkout -b $branchName 2>$null
        git pull origin $branchName --allow-unrelated-histories --no-edit 2>$null
    }
    
    Write-Host "Successfully checked out branch with existing commits." -ForegroundColor Green
} else {
    Write-Host "No existing commits found. This will be the initial push." -ForegroundColor Yellow
    git checkout -b main 2>$null
    $branchName = "main"
}

# Show current status
Write-Host "`nCurrent repository status:" -ForegroundColor Cyan
git status

# Add all files (respecting .gitignore)
Write-Host "`nAdding all files to staging..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "`nFiles to be committed:" -ForegroundColor Cyan
    git status --short
    
    Write-Host "`nCommitting changes (this will be a NEW commit on top of existing history)..." -ForegroundColor Cyan
    $commitMessage = "Update project files - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully committed changes!" -ForegroundColor Green
    } else {
        Write-Host "Commit failed. Please check the error above." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "No changes to commit. All files are already up to date." -ForegroundColor Yellow
}

# Show commit history before push
Write-Host "`nRecent commit history (showing last 5 commits):" -ForegroundColor Cyan
git log --oneline -5

# Push to GitHub (without force to preserve history)
Write-Host "`nPushing to GitHub (preserving all existing commits)..." -ForegroundColor Cyan
git push -u origin $branchName

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: $remoteUrl" -ForegroundColor Cyan
    Write-Host "All existing commits have been preserved!" -ForegroundColor Green
} else {
    Write-Host "`nPush failed. Checking if we need to pull first..." -ForegroundColor Yellow
    
    # Try pulling first if there are remote changes
    Write-Host "Attempting to pull latest changes..." -ForegroundColor Cyan
    git pull origin $branchName --no-edit
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Pull successful. Attempting push again..." -ForegroundColor Cyan
        git push -u origin $branchName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✓ Successfully pushed to GitHub!" -ForegroundColor Green
        } else {
            Write-Host "`nPush still failed. Please check the error messages above." -ForegroundColor Red
            Write-Host "You may need to resolve conflicts manually." -ForegroundColor Yellow
        }
    } else {
        Write-Host "`nPlease resolve any conflicts and try again." -ForegroundColor Red
    }
}

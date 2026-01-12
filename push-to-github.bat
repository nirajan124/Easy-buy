@echo off
REM Batch script to push to GitHub while preserving ALL previous commits
echo ========================================
echo Pushing to GitHub - Preserving All Commits
echo ========================================
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not found!
    echo Please install Git from: https://git-scm.com/download/win
    echo Make sure to add Git to PATH during installation.
    pause
    exit /b 1
)

echo Git found!
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Check if .git exists
if exist .git (
    echo Git repository already initialized.
) else (
    echo Initializing Git repository...
    git init
)

REM Set remote
echo Setting up remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/nirajan124/Easy-buy.git

REM Fetch existing history
echo.
echo Fetching existing commit history from GitHub...
git fetch origin

REM Check for existing branches
git ls-remote --heads origin main >nul 2>&1
if %errorlevel% equ 0 (
    set BRANCH=main
    goto :checkout_branch
)

git ls-remote --heads origin master >nul 2>&1
if %errorlevel% equ 0 (
    set BRANCH=master
    goto :checkout_branch
)

echo No existing branch found. Creating new main branch...
git checkout -b main
set BRANCH=main
goto :add_files

:checkout_branch
echo Found existing %BRANCH% branch. Preserving all commits...
git checkout -b %BRANCH% origin/%BRANCH% 2>nul
if errorlevel 1 (
    echo Creating local branch and merging remote history...
    git checkout -b %BRANCH% 2>nul
    git pull origin %BRANCH% --allow-unrelated-histories --no-edit 2>nul
)

REM Show commit count
for /f %%i in ('git rev-list --count origin/%BRANCH% 2^>nul') do set COMMIT_COUNT=%%i
if defined COMMIT_COUNT (
    echo Found %COMMIT_COUNT% existing commits - these will be preserved!
)

:add_files
echo.
echo Adding all files to staging...
git add .

echo.
echo Current status:
git status --short

echo.
echo Committing changes (new commit on top of existing history)...
git commit -m "Update project files - %date% %time%"

if errorlevel 1 (
    echo No changes to commit or commit failed.
    echo Checking if we can push existing commits...
) else (
    echo Successfully committed!
)

echo.
echo Recent commit history:
git log --oneline -5

echo.
echo Pushing to GitHub (preserving all existing commits)...
git push -u origin %BRANCH%

if errorlevel 1 (
    echo.
    echo Push failed. Attempting to pull latest changes first...
    git pull origin %BRANCH% --no-edit
    
    if not errorlevel 1 (
        echo Pull successful. Pushing again...
        git push -u origin %BRANCH%
    )
)

if errorlevel 1 (
    echo.
    echo ========================================
    echo Push completed with errors.
    echo Please check the messages above.
    echo ========================================
) else (
    echo.
    echo ========================================
    echo SUCCESS! Pushed to GitHub!
    echo Repository: https://github.com/nirajan124/Easy-buy
    echo All existing commits have been preserved!
    echo ========================================
)

pause

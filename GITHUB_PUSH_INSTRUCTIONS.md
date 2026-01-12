# Instructions to Push Project to GitHub

## Prerequisites
1. **Git must be installed** on your system
   - If not installed, download from: https://git-scm.com/download/win
   - During installation, make sure to select "Add Git to PATH"

## Method 1: Using the PowerShell Script (Recommended)

1. Open PowerShell in the project directory
2. Run the script:
   ```powershell
   .\push-to-github.ps1
   ```

## Method 2: Manual Steps

If the script doesn't work, follow these steps manually:

### Step 1: Initialize Git Repository (if not already done)
```powershell
cd "C:\Users\niraj\OneDrive\Desktop\Easy Buy"
git init
```

### Step 2: Add Remote Repository
```powershell
git remote add origin https://github.com/nirajan124/Easy-buy.git
```

If remote already exists, remove it first:
```powershell
git remote remove origin
git remote add origin https://github.com/nirajan124/Easy-buy.git
```

### Step 3: Fetch Existing History (Preserves ALL Commits)
```powershell
git fetch origin
```

### Step 4: Check Existing Branches and Commit Count
```powershell
git branch -a
git rev-list --count origin/main  # Shows number of existing commits
```

### Step 5: Checkout Existing Branch (Preserves All ~20 Commits)
**IMPORTANT**: Checkout the existing branch FIRST to preserve all commits:
```powershell
# If main branch exists
git checkout -b main origin/main

# OR if master branch exists
git checkout -b master origin/master
```

This ensures all your existing ~20 commits are preserved!

### Step 6: Add All Files
```powershell
git add .
```

### Step 7: Commit Changes
```powershell
git commit -m "Update project files"
```

### Step 8: Push to GitHub (Preserves All Commits)
**IMPORTANT**: Push WITHOUT force to preserve all existing commits:
```powershell
git push -u origin main
```

If you get an error about diverged branches, pull first:
```powershell
git pull origin main --no-edit
git push -u origin main
```

**NEVER use --force** unless you're absolutely sure, as it will overwrite your existing commits!

## Important Notes

- **Preserving History**: This method preserves ALL your existing ~20 commits by checking out the existing branch first
- **New Commits**: Your current changes will be added as NEW commits on top of the existing history
- **Never Use Force**: Do NOT use `--force` or `--force-with-lease` as it will overwrite your existing commits
- **Authentication**: You may be prompted for GitHub credentials. Use a Personal Access Token if 2FA is enabled
- **Commit Count**: Use `git rev-list --count origin/main` to verify the number of existing commits before pushing

## Troubleshooting

### Git Not Found
- Make sure Git is installed and added to PATH
- Restart PowerShell after installing Git
- Try using Git Bash instead of PowerShell

### Authentication Issues
- Use a Personal Access Token instead of password
- Generate token at: https://github.com/settings/tokens
- Use token as password when prompted

### Merge Conflicts
- Resolve conflicts manually if they occur
- Use `git status` to see conflicted files
- After resolving, `git add .` and `git commit`

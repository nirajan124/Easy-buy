# Quick Guide: Push to GitHub (Preserving All Commits)

## Option 1: Run the Batch File (Easiest)

1. **Make sure Git is installed**
   - Download from: https://git-scm.com/download/win
   - During installation, check "Add Git to PATH"

2. **Double-click `push-to-github.bat`** or run it from PowerShell:
   ```powershell
   .\push-to-github.bat
   ```

## Option 2: Manual Commands (If Batch File Doesn't Work)

Open **Git Bash** or **PowerShell** and run these commands:

```bash
# Navigate to project
cd "C:\Users\niraj\OneDrive\Desktop\Easy Buy"

# Initialize if needed
git init

# Add remote
git remote remove origin
git remote add origin https://github.com/nirajan124/Easy-buy.git

# Fetch existing commits (preserves all ~20 commits)
git fetch origin

# Checkout existing branch (preserves all commits)
git checkout -b main origin/main

# If checkout fails, try:
git checkout -b main
git pull origin main --allow-unrelated-histories --no-edit

# Add all files
git add .

# Commit new changes
git commit -m "Update project files"

# Push (preserves all existing commits)
git push -u origin main
```

## Important Notes

✅ **All your ~20 previous commits will be preserved**
✅ **New commits will be added on top**
❌ **DO NOT use `--force`** - it will delete your previous commits!

## If Git is Not Found

1. Install Git: https://git-scm.com/download/win
2. Restart your terminal/PowerShell
3. Run the batch file again

## Authentication

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - Generate token: https://github.com/settings/tokens
  - Select scope: `repo`

## Verify Commits Were Preserved

After pushing, check on GitHub:
1. Go to: https://github.com/nirajan124/Easy-buy
2. Click on "commits" or check the commit history
3. You should see all your previous ~20 commits + new ones

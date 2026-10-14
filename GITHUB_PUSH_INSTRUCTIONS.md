# SmartMeal — GitHub Push Instructions

## One-Time Setup: Create Repository and Push

The code is committed locally. Follow these steps to publish to GitHub.

### Step 1: Create the GitHub repository

1. Open: https://github.com/new
2. Fill in:
   - **Repository name:** `smartmeal`
   - **Description:** AI-Based College Meal Pre-Booking and Management System — Anurag University
   - **Visibility:** Public *(or Private for project submission)*
   - **DO NOT** check "Add a README file" or "Add .gitignore" — they already exist locally
3. Click **Create repository**

### Step 2: Push from your local machine

Open PowerShell and run:

```powershell
cd "c:\Users\KOTA MEHER MADHURI\SmartMeal"
git push -u origin master
```

Git will ask for your GitHub credentials:
- **Username:** `mehermadhuri`
- **Password:** Use a **Personal Access Token** (not your GitHub account password)

### Step 3: Create a Personal Access Token (if you don't have one)

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Set expiration (90 days recommended for a project)
4. Select scopes: ✅ `repo` (full control)
5. Click **Generate token**
6. Copy the token — use it as the password when Git asks

### After pushing, your repository will be at:
https://github.com/mehermadhuri/smartmeal

---

## Optional: Install GitHub CLI for future use

```powershell
winget install GitHub.cli
gh auth login
gh repo create smartmeal --public --source=. --remote=origin --push
```

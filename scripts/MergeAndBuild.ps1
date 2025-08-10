Param(
  [string]$RepoPath = (Get-Location).Path,
  [string]$UpstreamRemote = "upstream",
  [string]$UpstreamBranch = "main",
  [switch]$AutoResolve,
  [switch]$UseCI
)

$ErrorActionPreference = "Stop"

Write-Host "[MergeAndBuild] Repository: $RepoPath"
Set-Location -Path $RepoPath

# Stash local changes (including untracked)
if ((git status --porcelain) -ne "") {
  Write-Host "[MergeAndBuild] Stashing local changes..."
  git stash push -u -m "merge-and-build-$(Get-Date -Format "yyyyMMdd-HHmmss")" | Out-Null
}

# Ensure upstream remote exists
$remotes = git remote
if (-not ($remotes -split "\r?\n" | Where-Object { $_ -eq $UpstreamRemote })) {
  Write-Warning "[MergeAndBuild] Remote '$UpstreamRemote' is not configured. Aborting."
  exit 1
}

Write-Host "[MergeAndBuild] Fetching $UpstreamRemote..."
git fetch $UpstreamRemote --prune

# Merge upstream/main into current branch
$currentBranch = git rev-parse --abbrev-ref HEAD
Write-Host "[MergeAndBuild] Merging $UpstreamRemote/$UpstreamBranch into $currentBranch..."

try {
  if ($AutoResolve) {
    # Prefer upstream changes on conflicts (theirs)
    git merge "$UpstreamRemote/$UpstreamBranch" -X theirs
  } else {
    git merge "$UpstreamRemote/$UpstreamBranch"
  }
} catch {
  Write-Warning "[MergeAndBuild] Merge reported conflicts."
  if (-not $AutoResolve) {
    Write-Error "Conflicts detected. Re-run with -AutoResolve to attempt automatic resolution, or resolve manually."
    exit 1
  }
}

# If merge left conflicts and AutoResolve is on, try a naive resolve (keep theirs)
$conflictFiles = git diff --name-only --diff-filter=U
if ($conflictFiles) {
  if ($AutoResolve) {
    Write-Warning "[MergeAndBuild] Attempting naive auto-resolution (prefer theirs)..."
    foreach ($f in ($conflictFiles -split "\r?\n")) {
      if (-not [string]::IsNullOrWhiteSpace($f)) {
        git checkout --theirs -- "$f"
        git add -- "$f"
      }
    }
    git commit -m "chore: auto-resolve merge conflicts preferring upstream"
  } else {
    Write-Error "Unresolved conflicts remain. Aborting."
    exit 1
  }
}

# Pop stash, resolve if needed
if ((git stash list) -match "merge-and-build") {
  Write-Host "[MergeAndBuild] Applying stashed changes..."
  try {
    git stash pop
  } catch {
    Write-Warning "[MergeAndBuild] Conflicts during stash pop. Attempting staged apply with ours..."
    $stashRef = (git stash list --pretty=format:"%gd %s" | Select-String -Pattern "merge-and-build" | Select-Object -First 1).ToString().Split(" ")[0]
    if ($stashRef) {
      git checkout -m $stashRef
      git add -A
      git commit -m "chore: integrate stashed local changes"
      git stash drop $stashRef
    } else {
      Write-Error "Failed to identify stash ref for recovery."
      exit 1
    }
  }
}

# Install dependencies
Write-Host "[MergeAndBuild] Installing dependencies..."
if ($UseCI) {
  npm ci
} else {
  npm install
}

# Build (if available)
Write-Host "[MergeAndBuild] Building..."
try { npm run build } catch { Write-Warning "[MergeAndBuild] build script not defined or failed." }

# Test workspaces (CLI critical path)
Write-Host "[MergeAndBuild] Running tests for packages/cli..."
npm -s -w packages/cli test

if ($LASTEXITCODE -ne 0) {
  Write-Error "[MergeAndBuild] Tests failed."
  exit 1
}

Write-Host "[MergeAndBuild] Completed successfully."



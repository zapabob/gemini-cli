Param(
  [string]$Commit = '3ac15120191e078f363167c10fe927109a6fc6c3'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Move to repo root (this script lives in scripts/)
Set-Location -LiteralPath (Resolve-Path (Join-Path $PSScriptRoot '..'))

# Disable pagers/editors to avoid interactive prompts
$env:GIT_PAGER = ""
$env:PAGER = ""
$env:LESS = "FRX"
$env:GIT_EDITOR = "true"

# Helper
function Invoke-Git {
  param([Parameter(Mandatory)][string]$Args)
  Write-Host "> git $Args"
  git $Args
}

# Ensure repo
Invoke-Git "rev-parse --git-dir" | Out-Null

# Fetch upstream
Invoke-Git "fetch upstream"

# Ensure integration branch
try {
  Invoke-Git "checkout chore/integrate-upstream-2025-08-07"
} catch {
  Invoke-Git "checkout -b chore/integrate-upstream-2025-08-07"
}

# Cherry-pick target commit (prefer upstream changes on conflicts)
$cherryPickOk = $true
try {
  Invoke-Git "cherry-pick -x -X theirs $Commit"
} catch {
  $cherryPickOk = $false
}

if (-not $cherryPickOk) {
  # Try auto-resolve by staging all and continue
  Invoke-Git "add -A"
  try { Invoke-Git "cherry-pick --continue" } catch {}
}

# Re-apply latest stash if exists
$stashList = (git stash list) 2>$null
if ($LASTEXITCODE -eq 0 -and $stashList) {
  Write-Host "> re-applying stash"
  try {
    Invoke-Git "stash pop"
  } catch {
    Invoke-Git "add -A"
    try { Invoke-Git "commit -m \"chore: re-apply local stash after upstream cherry-pick\"" } catch {}
  }
}

# Install deps, build, test
Write-Host "> npm install"
& npm install --no-fund --no-audit
Write-Host "> npm run build"
& npm run -s build
Write-Host "> npm test"
& npm -s test

Write-Host "Done."

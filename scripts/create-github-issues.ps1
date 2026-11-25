# ============================================================
# AlmaLink — GitHub Issues + Project Board Creator
# Usage: $env:GH_TOKEN = "your_token"; .\scripts\create-github-issues.ps1
# ============================================================

$TOKEN = if ($env:GH_TOKEN) { $env:GH_TOKEN } else { Read-Host "Enter GitHub Personal Access Token" }
$OWNER = "Atharv005-A"
$REPO  = "AlmaLink"
$HEADER = @{
    Authorization          = "token $TOKEN"
    Accept                 = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}
$BASE = "https://api.github.com/repos/$OWNER/$REPO"

# ---- 1. Create Labels ----------------------------------------------------
Write-Host "`n[1/4] Creating labels..." -ForegroundColor Cyan

$labels = @(
    @{ name = "feature";  color = "0075ca"; description = "New feature or module implementation" },
    @{ name = "backend";  color = "d93f0b"; description = "Server / API work" },
    @{ name = "frontend"; color = "0e8a16"; description = "Client / UI work" },
    @{ name = "database"; color = "e4e669"; description = "Prisma schema / migrations" },
    @{ name = "devops";   color = "5319e7"; description = "CI/CD, deployment, tooling" },
    @{ name = "design";   color = "f9d0c4"; description = "Figma / Miro design work" },
    @{ name = "testing";  color = "1d76db"; description = "Unit / integration tests" }
)

foreach ($label in $labels) {
    $body = $label | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$BASE/labels" -Method POST -Headers $HEADER -Body $body -ContentType "application/json" | Out-Null
        Write-Host "  + Label: $($label.name)" -ForegroundColor Green
    } catch {
        Write-Host "  ~ Label exists or skipped: $($label.name)" -ForegroundColor Yellow
    }
}

# ---- 2. Define Issues ----------------------------------------------------
$issues = @(
    @{
        title  = "Module 1: Role-Based Authentication & Staff Onboarding"
        body   = @'
## Summary
Implement JWT-based login, role assignment (`SUPER_ADMIN`, `COLLEGE_ADMIN`, `CELL_COORDINATOR`, `ALUMNI`), forgot/reset password flow, and staff onboarding page.

## Deliverables
- [x] Login page with role-aware redirect
- [x] Register page with Zod validation
- [x] Forgot & reset password pages
- [x] Staff onboarding form
- [x] `requireAuth` + `requireRole` middleware
- [x] Auth schema unit tests
'@
        labels = @("feature", "backend", "frontend")
        state  = "closed"
    },
    @{
        title  = "Module 2: Alumni Registration & Verification Queue"
        body   = @'
## Summary
Alumni self-register and college admin verifies identity against college records before granting portal access.

## Deliverables
- [x] Alumni registration form (enrollment, batch, program)
- [x] Admin verification queue with filter/search
- [x] Individual verification review page
- [x] `PENDING -> VERIFIED / REJECTED` state machine
- [x] Email notification on status change
- [x] Verification schema unit tests
'@
        labels = @("feature", "backend", "frontend")
        state  = "closed"
    },
    @{
        title  = "Module 3: Activity & Event Management"
        body   = @'
## Summary
Cell Coordinators create and manage alumni engagement events (guest lectures, hackathons, mock interviews, mentorship sessions).

## Deliverables
- [x] Create / Edit / Publish activity form
- [x] Activity list page with status tabs (Draft / Published / Ongoing / Completed)
- [x] Activity category & required expertise tags
- [x] Admin activities view
- [x] Activity lifecycle unit tests
'@
        labels = @("feature", "backend", "frontend")
        state  = "closed"
    },
    @{
        title  = "Module 4: Alumni Invitation & Matchmaking Engine"
        body   = @'
## Summary
Coordinators invite relevant alumni to activities based on skills/expertise matching. Alumni view and RSVP to invitations.

## Deliverables
- [x] Find & Invite alumni page (skill-match filter)
- [x] Bulk dispatch invitations
- [x] Invitation tracking roster (Confirmed / Awaiting / Declined)
- [x] Alumni Invitations Hub portal (RSVP flow)
- [x] Invitation & matchmaking unit tests
'@
        labels = @("feature", "backend", "frontend")
        state  = "closed"
    },
    @{
        title  = "Module 5: College Staff & Cells Management"
        body   = @'
## Summary
Admin manages IMCC cells (Tech, Placement, Entrepreneurship, Cultural) and assigns coordinators to cells.

## Deliverables
- [x] Staff & Cells overview dashboard
- [x] Create new cell form
- [x] Invite staff and assign to cell
- [x] Staff-cells API endpoints
- [x] Staff-cells unit tests (11 tests)
'@
        labels = @("feature", "backend", "frontend")
        state  = "closed"
    },
    @{
        title  = "Module 6: Post-Event Attendance & Contribution Points Engine"
        body   = @'
## Summary
Coordinators record post-event attendance, assign contribution roles, attach evidence, and credit immutable points to alumni ledger.

## Deliverables
- [x] Attendance recording page (Attended / Absent toggle)
- [x] Contribution role + evidence URL fields
- [x] Points ledger (immutable records)
- [x] Scoring rubric settings page (Admin)
- [x] Participation schema unit tests
'@
        labels = @("feature", "backend", "frontend", "database")
        state  = "closed"
    },
    @{
        title  = "Module 7: Private Leaderboard, Award Nominations & Staff Voting"
        body   = @'
## Summary
Internal staff-only leaderboard and annual 'Alumni Contributor of the Year' awards with coordinator nominations, top-5 shortlist, democratic staff voting, and certificate generation.

## Deliverables
- [x] Private leaderboard (rank, points, cell filter, batch filter)
- [x] Points breakdown modal per alumnus
- [x] Coordinator nomination form (max 3 per cell/year)
- [x] Top 5 Shortlist curation (Admin)
- [x] Staff voting round (1 vote per member per year)
- [x] Winner confirmation + IMCC certificate PDF preview
- [x] Awards schema unit tests
'@
        labels = @("feature", "backend", "frontend", "database")
        state  = "closed"
    },
    @{
        title  = "Database Schema Design & Prisma Setup"
        body   = @'
## Summary
Design and implement the full AlmaLink PostgreSQL schema with 17 entities and 20 relationships using Prisma ORM.

## Deliverables
- [x] ERD design (v4 - 17 entities)
- [x] Prisma schema.prisma with all models
- [x] Migrations & seed scripts
- [x] Prisma client generation in CI
- [x] All FK constraints, unique constraints, default values
'@
        labels = @("database", "backend", "design")
        state  = "closed"
    },
    @{
        title  = "CI/CD Pipeline, Monorepo Build & Code Quality"
        body   = @'
## Summary
Set up GitHub Actions CI for automatic build, lint, format-check, and test on every push and pull request.

## Deliverables
- [x] GitHub Actions workflow (.github/workflows/ci.yml)
- [x] Prettier format check
- [x] ESLint lint check
- [x] Vitest unit test run (89 tests)
- [x] Full monorepo build (shared -> server -> client)
- [x] Branch protection on main (require PR + passing CI)
'@
        labels = @("devops", "testing")
        state  = "closed"
    }
)

# ---- 3. Fetch Existing Issues to Avoid Duplicates ------------------------
Write-Host "`n[2/4] Checking existing issues and creating missing ones..." -ForegroundColor Cyan

$existingIssues = Invoke-RestMethod -Uri "$BASE/issues?state=all&per_page=100" -Method GET -Headers $HEADER
$existingByTitle = @{}
foreach ($ei in $existingIssues) {
    if (-not $ei.pull_request) {
        $existingByTitle[$ei.title] = $ei
    }
}

$allIssueNodeIds = @()
$createdCount = 0

foreach ($issue in $issues) {
    if ($existingByTitle.ContainsKey($issue.title)) {
        $ei = $existingByTitle[$issue.title]
        $allIssueNodeIds += $ei.node_id
        Write-Host "  ~ Exists #$($ei.number) - $($issue.title)" -ForegroundColor Yellow
        continue
    }

    $body = @{
        title  = $issue.title
        body   = $issue.body
        labels = $issue.labels
    } | ConvertTo-Json -Depth 4

    $result = Invoke-RestMethod -Uri "$BASE/issues" -Method POST -Headers $HEADER -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -ContentType "application/json; charset=utf-8"
    $allIssueNodeIds += $result.node_id
    $createdCount++

    if ($issue.state -eq "closed") {
        $closeBody = '{"state":"closed","state_reason":"completed"}'
        Invoke-RestMethod -Uri "$BASE/issues/$($result.number)" -Method PATCH -Headers $HEADER -Body $closeBody -ContentType "application/json" | Out-Null
    }

    Write-Host "  + Created #$($result.number) - $($issue.title)" -ForegroundColor Green
    Start-Sleep -Milliseconds 300
}

Write-Host "`n[3/4] Issues ready: $($allIssueNodeIds.Count) total ($createdCount newly created)." -ForegroundColor Cyan

# ---- 4. Create GitHub Project (v2) & Link Issues if permitted ------------
Write-Host "`n[4/4] Setting up GitHub Project Board (Projects v2)..." -ForegroundColor Cyan

function Invoke-GitHubGraphQL {
    param([string]$Query, [hashtable]$Variables = @{})
    $payload = @{ query = $Query; variables = $Variables } | ConvertTo-Json -Depth 10
    $resp = Invoke-RestMethod -Uri "https://api.github.com/graphql" -Method POST -Headers $HEADER -Body ([System.Text.Encoding]::UTF8.GetBytes($payload)) -ContentType "application/json; charset=utf-8"
    if ($resp.errors) {
        throw ($resp.errors | ConvertTo-Json -Depth 5)
    }
    return $resp.data
}

try {
    $repoData = Invoke-GitHubGraphQL -Query @'
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    id
    owner { id }
    projectsV2(first: 10) {
      nodes { id title url number }
    }
  }
}
'@ -Variables @{ owner = $OWNER; repo = $REPO }

    $repoId = $repoData.repository.id
    $ownerId = $repoData.repository.owner.id
    $project = $repoData.repository.projectsV2.nodes | Where-Object { $_.title -eq "AlmaLink Development Board" } | Select-Object -First 1

    if (-not $project) {
        $createdProj = Invoke-GitHubGraphQL -Query @'
mutation($ownerId: ID!, $repoId: ID!, $title: String!) {
  createProjectV2(input: { ownerId: $ownerId, repositoryId: $repoId, title: $title }) {
    projectV2 { id title url number }
  }
}
'@ -Variables @{ ownerId = $ownerId; repoId = $repoId; title = "AlmaLink Development Board" }
        $project = $createdProj.createProjectV2.projectV2
        Write-Host "  + Created Project Board: $($project.title) ($($project.url))" -ForegroundColor Green
    } else {
        Write-Host "  ~ Using existing Project Board: $($project.title) ($($project.url))" -ForegroundColor Yellow
    }

    # Fetch Status field and Done option ID
    $projDetails = Invoke-GitHubGraphQL -Query @'
query($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField {
            id
            name
            options { id name }
          }
        }
      }
      items(first: 100) {
        nodes {
          id
          content {
            ... on Issue { id number }
          }
        }
      }
    }
  }
}
'@ -Variables @{ projectId = $project.id }

    $statusField = $projDetails.node.fields.nodes | Where-Object { $_.name -eq "Status" } | Select-Object -First 1
    $doneOption = $statusField.options | Where-Object { $_.name -eq "Done" } | Select-Object -First 1

    $existingItemMap = @{}
    foreach ($it in $projDetails.node.items.nodes) {
        if ($it.content.id) {
            $existingItemMap[$it.content.id] = $it.id
        }
    }

    foreach ($issueNodeId in $allIssueNodeIds) {
        $itemId = $existingItemMap[$issueNodeId]
        if (-not $itemId) {
            $added = Invoke-GitHubGraphQL -Query @'
mutation($projectId: ID!, $contentId: ID!) {
  addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
    item { id }
  }
}
'@ -Variables @{ projectId = $project.id; contentId = $issueNodeId }
            $itemId = $added.addProjectV2ItemById.item.id
        }

        if ($statusField -and $doneOption -and $itemId) {
            Invoke-GitHubGraphQL -Query @'
mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
  updateProjectV2ItemFieldValue(input: {
    projectId: $projectId,
    itemId: $itemId,
    fieldId: $fieldId,
    value: { singleSelectOptionId: $optionId }
  }) {
    projectV2Item { id }
  }
}
'@ -Variables @{
                projectId = $project.id
                itemId    = $itemId
                fieldId   = $statusField.id
                optionId  = $doneOption.id
            } | Out-Null
        }
    }

    Write-Host "  + All $($allIssueNodeIds.Count) issues linked to '$($project.title)' with Status = Done!" -ForegroundColor Green
    Write-Host "`nProject Board URL: $($project.url)" -ForegroundColor Cyan
} catch {
    Write-Host "  ! Could not auto-create/update Project Board (check if token has 'project' scope):" -ForegroundColor Red
    Write-Host "    $_" -ForegroundColor DarkRed
    Write-Host "    Go to https://github.com/$OWNER/$REPO/projects to create the board manually and add the issues." -ForegroundColor Yellow
}

# MINI-BLOG BACKLOG OPERATING STANDARD (GITHUB-ONLY)

## Purpose

This document defines the working standard for:

- backlog formatting in GitHub Issues
- synchronization rules between GitHub Issues and GitHub Project backlog

Goal: keep the backlog clear and consistent across planning and delivery for this repository.

## Scope

This workflow applies to:

- GitHub repository issues: `mudmykola/mud-tech-blog`
- GitHub Project backlog: `mud-tech-blog Backlog` (`https://github.com/users/mudmykola/projects/2`)

## Core Principle

Every task follows this lifecycle:

`BACKLOG -> ISSUE -> IN PROGRESS -> IMPLEMENTATION -> DONE -> DEV LOG -> COMMIT`

Notes:

- User performs commits manually.
- Agent never auto-commits.

## Project Standard (GitHub)

### Project name

- `mud-tech-blog Backlog`

### Project summary style

One concise sentence describing:

- what the backlog tracks
- planning focus
- synchronization scope (GitHub Issues + GitHub Project)

### Project description style

Use 2 short sentences:

- What work is tracked (features, UX improvements, issue triage)
- Why this project exists (planning hub + reliable execution flow)

## Issue Naming Standard

Use one action-oriented style:

`<Area>: <Action-oriented title>`

Examples:

- `Frontend: Add article card loading skeleton`
- `Core: Refactor meta tag utility for route-level defaults`
- `SEO: Fix canonical URL generation for blog posts`

Common areas:

- Core
- Frontend
- UI
- SEO
- Content
- Deployment

Use imperative verbs:

- Add ...
- Refactor ...
- Fix ...
- Document ...
- Audit ...
- Optimize ...

## Issue Description Standard

Use this structure:

- Goal: what outcome is needed
- Scope: bullets of included work
- Acceptance criteria: testable bullets
- Notes: optional constraints/links

## Labeling Standard

Use two label layers.

### Layer 1: System labels

- `frontend`
- `core`
- `ui/ux`
- `backend`
- `api`
- `seo`

### Layer 2: Planning labels

- `Feature`
- `Improvement`
- `Bug`
- `Refactor`
- `UI`
- `Content`
- `Mobile`
- `Deployment`

Rules:

- Every task must include at least one planning label.
- Keep system labels and planning labels together.

## Priority Standard (Required On Create)

Always set a priority label when creating a backlog task:

- `priority: urgent` -> production incidents or security-sensitive breakage
- `priority: high` -> correctness, SEO correctness, CI/package integrity, user-facing breakage
- `priority: medium` -> reliability/UX improvements, DX cleanup, non-critical refactors
- `priority: low` -> optimizations and low-impact improvements

Never leave backlog tasks without priority.

## Assignee Standard

- Default assignee: `me` (if empty)
- If already assigned, do not overwrite unless explicitly requested

## Status Standard

Workflow:

- `Backlog`
- `In Progress`
- `Done`

Status mapping:

- GitHub Issue `OPEN` <-> Project `Backlog` or `In Progress`
- GitHub Issue `CLOSED` <-> Project `Done`

Operational rule:

- Close GitHub issue only when Project status is `Done`.

## Source of Truth

- Status: GitHub Project workflow field is source of truth
- Labels: GitHub Issue is source of truth
- Description and acceptance criteria: GitHub Issue is source of truth
- Planning metadata (priority labels, milestone, assignee): GitHub Issue/Project only

## Identity and Deduplication

Primary key: GitHub issue number (`#N`).

Deduplication rules:

- Before creating a task, search for existing issue with same scope/title intent
- If found and equivalent, update existing issue instead of creating a duplicate
- If ambiguous duplicates exist, mark for manual review

## GitHub Project Backlog Sync (Required)

Rules:

- Every active repository issue must be present as an item in `mud-tech-blog Backlog`
- If an issue is missing from the Project, add it
- Do not create duplicate Project items for the same issue
- Keep Project workflow state aligned with issue execution state

Project status mapping:

- Backlog -> `Backlog` (or `Todo` if needed)
- In Progress -> `In Progress`
- Done -> `Done`

If exact option names differ, map to the nearest equivalent and note mapping in execution summary.

## Conflict Policy

Status conflicts:

- Project status wins
- Sync issue state to match project status mapping

Label conflicts:

- Issue labels win
- Keep non-standard labels unless explicitly removed by user

Title conflicts:

- Do not auto-rename unless title breaks naming standard materially

Description conflicts:

- Issue body remains canonical

## Safe Update Rules

Automation may update:

- status
- labels
- assignee (only when empty)
- issue open/closed state from status mapping
- project item membership and workflow state

Automation must not auto-update:

- priority if already set
- estimates
- milestones
- unrelated metadata

## Review Checklist (Backlog Quality)

Before a task is considered well-formed:

- Correct project (`mud-tech-blog Backlog`)
- Title follows naming standard
- Assignee is set (or intentionally unassigned)
- At least one system label when applicable
- At least one planning label
- Priority label is present
- Description has clear acceptance criteria

## Daily Execution Protocol

### Before starting work

- Create a new GitHub Issue for every new implementation task (no work without a task)
- Add the issue to GitHub Project backlog before coding starts
- Ensure task exists in GitHub Issue + GitHub Project
- Set missing priority label
- Set assignee to `me` if missing
- Move Project item status to `In Progress` before coding starts

### During work

- Keep status synced with actual execution state
- If scope changes materially, update issue title/description
- Keep acceptance criteria current
- After each meaningful change batch, propose a commit title/message to the user

### After finishing work (before user commit)

- Set Project item to `Done`
- Close GitHub issue
- Add short public Dev Log entry (`/updates`) for user-facing changes
- Provide final proposed commit message to user
- User performs commit manually

## Task Lifecycle Enforcement

Rules:

- One implementation task -> one dedicated backlog issue
- Start state: `In Progress` in Project before coding
- End state: `Done` in Project + Issue closed after implementation
- Do not leave completed code changes without backlog state closure

## Dev Log Rule (Required)

After each completed user-facing task, update `/updates` data source with:

- datetime
- type (`Feature`, `Improvement`, `Fix`, `Refactor`)
- author
- short title
- short summary
- affected route/tool/page
- issue reference (`GH #N`)

Dev Log intent:

- `/updates` must reflect dynamic history of changes, fixes, and new features
- Entries should be concise, chronological, and user-visible

## Commit Message Standard

Format:

`<type>(<scope>): <final result>`

Types:

- `feat`
- `fix`
- `refactor`
- `chore`
- `perf`
- `seo`

Scopes:

- `layout`
- `header`
- `converter`
- `seo`
- `core`
- `api`
- `ui`
- `deployment`
- `auth`

Message style:

- final state
- action-oriented
- production wording

Examples:

- `fix(layout): finalize sticky header and mobile topbar polish`
- `feat(core): implement article filtering with stable URL sync`
- `seo(seo): optimize canonical and Open Graph metadata generation`

Commit proposal rule:

- After each completed change batch in a task, always suggest a commit title to the user

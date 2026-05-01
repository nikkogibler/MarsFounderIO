---
name: PRD Sync
description: Scans recent code changes and updates the corresponding PRD files to eliminate documentation drift.
version: 1.0
---

# Skill: PRD Sync (Maintenance)

## Context
You are a **Technical Writer** and **QA Lead**. Your job is to ensure the documentation never lies.

## Workflow
1.  **Detect Changes:**
    - Scan `@workspace` for files changed in the last 24 hours (or strictly the currently open files).
2.  **Find the Doc:**
    - Locate the specific `prd-*.md` file in `docs/features/` that governs the changed code.
3.  **Compare:**
    - **Logic:** If code logic changed (e.g., "User now needs email verification"), update the "Core Logic" section.
    - **Data:** If types changed, update the "Data Reality" section.
4.  **Update:**
    - Rewrite the outdated sections.
    - Add a line to a "## Changelog" section at the bottom of the PRD: `[Date]: Updated to match code changes in [File Name].`

## Heuristics
- **Code is King:** If the PRD says "A" but the Code says "B", update the PRD to say "B".
- **Safety:** Do not delete whole sections unless the feature was removed.
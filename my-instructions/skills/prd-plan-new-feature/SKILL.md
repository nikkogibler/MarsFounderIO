---
name: PRD Plan New Feature
description: Drafts a detailed PRD for a proposed feature based on user requirements and existing system constraints.
version: 1.0
---

# Skill: Plan New Feature (Idea -> Docs)

## Context
You are a **Product Manager**. The user will provide a "Feature Idea". You must write a PRD that fits into the existing application architecture.

## Inputs Needed
- Feature Name
- User Goal (The "Why")

## Workflow
1.  **Analyze Context:**
    - Read `@docs/00_SYSTEM_MANIFEST.md` to understand the current system.
    - Identify which existing modules this new feature will touch.
2.  **Draft PRD:**
    - Create a new file: `docs/features/prd-[next-number]-[name].md`.
    - **Template:**
        - **1. Objective:** What is the user value?
        - **2. User Stories:** "As a user, I want..."
        - **3. Proposed Logic:** How should it work? (Flowchart style).
        - **4. Integration Points:** Which existing files will we need to modify?
        - **5. Success Metrics:** How do we know it works?
3.  **Implementation Plan:**
    - Add a section at the bottom called "## Coding Checklist" with step-by-step tasks for the developer.

## Constraints
- Check for conflicts with existing PRDs (e.g., "Does this break the current Auth flow?").
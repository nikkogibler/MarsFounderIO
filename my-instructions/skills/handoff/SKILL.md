---
name: handoff
description: Create a date-stamped markdown handoff document that captures enough verified context for another agent to resume quickly and safely. Use when the user asks for a handoff, session summary, continuation brief, context file, or wants to save work state for another agent.
argument-hint: "[artifact, scope, or destination folder]"
---

# Handoff

Write a continuation-grade markdown handoff, not a fluffy recap.

The handoff exists so another agent can resume work without reconstructing the whole session from chat. It should be detailed on the important parts, compressed on the unimportant parts, and explicit about what was actually verified.

## When To Use

Use this skill when the user says things like:

- create a handoff
- make a session summary for another agent
- save the context to a markdown file
- create a continuation brief
- write a handoff doc
- summarize what we did so another agent can continue

## Core Outcome

Produce one markdown file that gives another agent enough context to:

- understand what was built or decided
- know which files matter
- know what constraints to preserve
- know what is already validated
- know what still needs work

## Default Location Rules

If the user does not specify a path:

1. Prefer an existing `chat_session_summaries/` folder in the active workspace.
2. Otherwise place the handoff next to the primary artifact or file worked on.
3. Otherwise place it in the active workspace root.
4. Never overwrite an existing handoff file without explicit user permission.

## Filename Convention

Default to:

`YYYY-MM-DD-HHMM_<CATEGORY>_<artifact-or-scope>_session-handoff.md`

Guidelines:

- Use the current date and time.
- Always include a `<CATEGORY>_` tag in ALL CAPS immediately after the timestamp.
- Use a lowercase slug with hyphens for the artifact/scope segment.
- Use the main artifact, feature, or file family as the artifact segment.
- If there are multiple artifacts, choose the one that best identifies the work.

### Category Tag

Pick one category that best describes what the session was about. Always uppercase, followed by an underscore.

Standard categories:

- `DEBUG_` — diagnosing or fixing a bug, regression, performance issue, or broken behavior.
- `NEWFEATURE_` — building a new feature, page, component, endpoint, or capability from scratch.
- `EXPERIMENT_` — exploratory / spike / proof-of-concept work that may or may not ship.
- `IMPROVEMENT_` — refactor, polish, or enhancement of something that already works (not bug-driven).

If none of the above clearly fit, invent a short, descriptive, uppercase category tag (e.g. `MIGRATION_`, `RESEARCH_`, `PLANNING_`, `DOCS_`, `AUDIT_`). Prefer one of the standard four when possible; only mint a new tag when the session genuinely doesn't fit.

Rules:

- Exactly one category tag per handoff. Do not stack (`DEBUG_IMPROVEMENT_` is not allowed).
- If the session was mostly one category with a small amount of another, pick the dominant one.
- The category reflects the session's intent, not the file type.

Examples:

- `2026-04-23-1247_DEBUG_landing-page-performance_session-handoff.md`
- `2026-04-20-1430_NEWFEATURE_scheduler-ui_session-handoff.md`
- `2026-04-20-1430_EXPERIMENT_airtable-crm-model_session-handoff.md`
- `2026-04-20-1430_IMPROVEMENT_interzekt-customer-journey-operating-checklist_session-handoff.md`
- `2026-04-20-1430_MIGRATION_firestore-meals-schema_session-handoff.md`

## What To Gather Before Writing

Before creating the handoff, inspect the current workspace and gather the facts that matter most:

- Primary file or artifact worked on
- Other changed files that materially matter to continuation
- Main objective of the session
- Important iterations or pivots in direction
- Decisions made about architecture, naming, process, or ownership
- Current state of the UI or behavior if relevant
- Validation performed: browser checks, errors checked, tests run or not run
- Open issues, unresolved risks, or things intentionally deferred
- Any workspace-specific routing, memory, or task-tracking rules that affect future work
- Skills used if they materially influenced the approach
- Always reference the previous handoff if this is a continuation of an earlier session, and call out what has changed since then.

Do not dump raw transcripts or whole files. Summarize them into high-value context.

## Required Handoff Structure

Use a structure close to this unless the user asks for a different format:

### Title

Use a clear title naming the artifact or feature.

### Metadata

Include compact bullets for:

- Date
- Naming convention used
- Artifact or feature
- Primary file
- Workspace or repo

### Purpose

State what this session was trying to accomplish.

### Final State

Describe the current artifact/system state as another agent should assume it now exists.

### Files Created / Changed

List the relevant files. Focus on the ones another agent actually needs to inspect.

### Major Accomplishments

Summarize the important outcomes with enough detail to preserve reasoning, not just output.

### Important Decisions / Rules

Capture the decisions that future work must respect, such as:

- data model rules
- stack ownership rules
- naming rules
- UX rules
- process rules

### Validation Status

Be explicit:

- what was validated
- what was only inferred
- what was not tested

### Current State To Preserve

Call out the current UI, behavior, or process rules that should remain unless the user explicitly changes them.

### Next Steps

List the most natural follow-up tasks.

### Short Continuation Summary

End with a short paragraph another agent could skim in under 20 seconds.

## Writing Standard

The handoff should be:

- detailed on critical decisions
- concise on repetitive iterations
- explicit about verified vs inferred facts
- optimized for continuation, not storytelling

Avoid:

- motivational language
- chatty filler
- vague summaries like “various improvements were made”
- pretending tests passed if they were not run

## Verification Discipline

Mark only verified facts as verified.

- If you opened the page and saw the UI, say it was validated in the browser.
- If you only edited the file and did not reload, do not claim live validation.
- If no tests were run, say so.
- If the session had noisy side effects, mention them if another agent would care.

## Final Delivery

After creating the handoff file:

1. Tell the user where it is.
2. State the filename convention used.
3. Briefly summarize what the handoff contains.

If the workspace has task logging requirements, follow them after the handoff is created.

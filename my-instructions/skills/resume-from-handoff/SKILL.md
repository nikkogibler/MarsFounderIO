---
name: resume-from-handoff
description: Load a handoff markdown from the workspace, extract the actionable context, verify the important referenced files, and continue work from where a previous agent left off. Use when the user says resume from handoff, continue from handoff, use this handoff, or wants an agent to pick up from a saved context file.
argument-hint: "[path to handoff markdown, or leave blank to ask for it]"
---

# Resume From Handoff

This skill is for the receiving agent.

Its job is not to blindly trust the handoff. Its job is to use the handoff as a fast orientation layer, verify the important facts, and then continue work without making the user restate the whole project.

## When To Use

Use this skill when the user says things like:

- resume from this handoff
- continue from the handoff file
- load this session handoff
- pick up where the last agent left off
- use the handoff markdown in the workspace

## First Step: Ask For The Source Path If Missing

If the user has not already provided the handoff file path, ask for it immediately.

Use a concise prompt like:

`What is the path to the handoff markdown in the workspace? You can paste an absolute path or a workspace-relative path.`

Do not proceed until you have the source handoff path.

## Core Workflow

Once you have the path:

1. Read the handoff markdown immediately.
2. Extract the key context.
3. Re-open or re-read the primary file(s) named in the handoff.
4. Verify the important current-state claims before editing anything critical.
5. Summarize the imported context to the user in a compact execution brief.
6. Continue with the new request using the handoff as the working baseline.

## What To Extract From The Handoff

Pull out:

- artifact or feature name
- primary file(s)
- files created or changed
- current state to preserve
- decisions and rules that constrain future work
- validation status
- open issues or deferred items
- next recommended steps

## Verification Rules

Treat the handoff as trusted orientation, not as a substitute for inspection.

Before making important edits:

- verify the primary file still exists
- verify the relevant code or markup still matches the handoff’s description
- verify any live UI claims if the next task depends on them
- re-check errors/tests if they matter to the next step

If a handoff claim is outdated, say so and proceed using the current file state.

## Import Brief Format

After reading and verifying the handoff, give the user a compact brief such as:

- what artifact you loaded
- which file is primary
- what current state is verified
- which constraints you will preserve
- what the obvious next step is

Do not dump the whole handoff back to the user.

## If Files Are Missing Or Stale

If the handoff references files that no longer exist or a state that no longer matches the workspace:

- say exactly what is stale or missing
- fall back to the current file state
- preserve still-valid decisions where possible
- continue from the live workspace, not the old assumption

## Preserve Unless Overridden

If the handoff explicitly lists current state to preserve, keep those constraints in place unless:

- the user overrides them
- the live file clearly no longer matches them
- they conflict with the new request

## Good Receiving-Agent Behavior

Do:

- use the handoff to accelerate context loading
- verify important implementation details before editing
- continue autonomously once context is loaded
- respect the preserve-list and decision-list unless the user changes direction

Do not:

- ask the user to repeat information already in the handoff
- restate the entire handoff verbatim
- blindly trust stale context without checking the file
- ignore explicit next-step guidance if it is still relevant

## Suggested Trigger Phrases

This skill should feel natural to invoke for phrases like:

- `resume from handoff`
- `continue from handoff`
- `load this handoff`
- `pick up from this context file`
- `use the handoff at [path]`

## Final Goal

The user should feel like they handed one capable agent’s context directly to another capable agent without losing momentum.

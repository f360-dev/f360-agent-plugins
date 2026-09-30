---
name: requesting-code-review
description: Use when the user asks for a code review, after meaningful implementation work, or before merging to assess changes against requirements and project conventions
---

# Requesting Code Review

Request a review of a clearly defined change set. Use the `code-reviewer` agent provided by this plugin when agent invocation is available; otherwise perform the review directly. The sibling `code-reviewer.md` file is the review brief template: read it, fill every applicable placeholder, and pass its contents to the reviewer. It is not loaded automatically.

**Core principle:** Review early, review often.

## When to Request Review

**Recommended:**
- After a meaningful task or feature with an identifiable change set
- Before merging changes that affect behavior, data, security, public contracts, or architecture
- After a complex fix when an independent review can help

Do not treat every tiny or documentation-only task as requiring a separate review unless the user's workflow requires it. If the change set is not available or the review agent cannot be invoked, review directly when possible and state any scope limitation.

## How to Request

**1. Define the change set:**
- Set `HEAD_SHA` to the commit containing the work being reviewed.
- Set `BASE_SHA` to the commit immediately before the task, or to the merge base with the intended target branch for a branch/PR review. Confirm the target branch exists before using it; do not assume `HEAD~1` covers the task.
- Check that both commits exist and that `BASE_SHA..HEAD_SHA` represents the intended changes. Do not switch branches, reset, or alter the worktree to prepare a review.
- If relevant work is uncommitted, explicitly include and identify staged and unstaged changes. `git diff BASE_SHA` includes committed changes since that base plus tracked working-tree changes; inspect untracked files separately. Do not imply untracked files were reviewed unless they were opened.

**2. Send the review brief:**

Read `code-reviewer.md` beside this skill, fill its placeholders, and pass the completed brief to the plugin's `code-reviewer` agent. The agent definition is in `agents/code-reviewer.md`. If that agent is unavailable, use the brief as your own review checklist instead of referring to an unavailable `Task` tool or external `superpowers` agent.

**Placeholders:**
- `{WHAT_WAS_IMPLEMENTED}` - What you just built
- `{PLAN_OR_REQUIREMENTS}` - The applicable requirements or plan; state when none were provided
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit
- `{CHANGE_SCOPE}` - The exact commits/files and whether staged, unstaged, or untracked changes are included
- `{DESCRIPTION}` - Brief summary

**3. Act on feedback:**
- Address Critical findings before continuing or merging.
- Resolve Important findings before merging, or record the reason and explicit disposition.
- Record Minor findings for follow-up when useful.
- Do not change code based only on a review request; report findings and let the user or task owner decide unless implementation was also requested.
- If the reviewer is wrong, respond with concrete code or test evidence and ask it to reconsider.

## Example

```
[Just completed a task with a reviewable change set]

You: Let me request code review before proceeding.

BASE_SHA: commit before the task (verified to exist)
HEAD_SHA: commit containing the task

[Invoke the plugin's code-reviewer agent with the filled sibling template]
  WHAT_WAS_IMPLEMENTED: Verification and repair functions for conversation index
  PLAN_OR_REQUIREMENTS: Task 2 from docs/plans/deployment-plan.md
  CHANGE_SCOPE: BASE_SHA..HEAD_SHA; no working-tree changes
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Task-Based Development:**
- Review after a meaningful task when its change set can be isolated.
- For tiny sequential tasks, review a useful batch rather than repeating a review with no material changes.

**Executing Plans:**
- Review at natural checkpoints or before merging; choose a range that covers the work since the last checkpoint.

**Ad-Hoc Development:**
- Review before merging substantive changes or when an independent perspective would help.

## Red Flags

**Always:**
- State precisely which commits and working-tree files were reviewed.
- Report unavailable requirements, tools, or tests as limitations; never imply they were checked.
- Keep findings tied to the reviewed changes and cite file and line.

The template is the sibling file `code-reviewer.md`; load it when preparing a review, not by assuming it is injected with this skill.

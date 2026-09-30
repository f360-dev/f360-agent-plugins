# Code Review Brief

Use this brief when invoking the plugin's `code-reviewer` agent, or as a checklist when reviewing directly. Replace every placeholder and pass the completed brief to the reviewer. This file is a template and is not loaded automatically with the skill.

## Review Request

### What changed

{DESCRIPTION}

### Implementation details

{WHAT_WAS_IMPLEMENTED}

### Requirements or plan

{PLAN_OR_REQUIREMENTS}

If no written requirements or plan were provided, say so and assess correctness against the observable behavior and applicable project conventions. Do not invent requirements.

### Change scope

{CHANGE_SCOPE}

### Git range

- Base commit: `{BASE_SHA}`
- Head commit: `{HEAD_SHA}`
- Commit diff: `git diff --stat {BASE_SHA}..{HEAD_SHA}` and `git diff {BASE_SHA}..{HEAD_SHA}`

If staged or unstaged tracked changes are included, inspect `git diff {BASE_SHA}` and `git diff --cached {BASE_SHA}` as applicable. Identify untracked files in scope and open them explicitly. Do not alter the worktree or review outside the stated scope.

## Review Checklist

- Does the change satisfy the stated requirements and preserve relevant existing behavior and contracts?
- Are there concrete correctness, data integrity, security, error handling, or performance problems in the changed code?
- Does it follow patterns and conventions used by this repository? Avoid generic style preferences unsupported by project conventions.
- Are meaningful edge cases handled? Are tests appropriate for the behavior changed?
- Are compatibility, migration, and documentation impacts addressed where applicable?

Do not treat the use of mocks alone as evidence that a test does not exercise logic. Do not run tests unless requested or permitted by the active task instructions. Report tests as **passed**, **failed**, or **not run**, with the command and reason where known. Never claim validation that was not performed.

## Output Format

### Findings

List actionable findings in severity order. For each finding include:

- Severity: **Critical**, **Important**, or **Minor**
- File and line (or the closest precise location)
- The concrete problem and when it occurs
- Its impact
- A suggested correction when clear

Only report issues introduced by or materially affected by this change. If there are no findings, say so explicitly. Do not manufacture findings to fill a severity section.

### Strengths

Mention specific positive choices when useful; do not let praise obscure findings.

### Validation and limitations

List checks actually performed and their results. State tests or scope that were not reviewed, and why.

### Assessment

State whether the reviewed change is **Ready**, **Ready with follow-up**, or **Needs fixes**, with a brief reason. The assessment is advisory and does not replace the owner's merge decision.

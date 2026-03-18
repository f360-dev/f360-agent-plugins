---
name: f360-git-conventions
description: Git commit and pull request conventions for F360 Financas. Use when writing commit messages, opening PRs, or reviewing changes.
---

# F360 Git Conventions

Suggested conventions for commits and pull requests in this repository.

## When to use

- Writing or amending commit messages
- Creating or describing pull requests
- Reviewing branch names or PR titles

## Commit messages

Prefer **Conventional Commits** style for clarity and automation. **The Jira card ID must be present in every commit** (e.g. FINC-123) so that commits are traceable to the backlog.

- **feat**: new feature or capability
- **fix**: bug fix
- **refactor**: code change that neither fixes a bug nor adds a feature
- **docs**: documentation only
- **chore**: build, tooling, or non-code changes
- **test**: adding or updating tests

Format:

```
<type>(<jira-id>): <short description>

[optional body]
```

The scope is the **Jira card key** (e.g. FINC-123). Use the ID of the card that the change relates to.

Examples:

- `fix(FINC-123): mensagem do commit`
- `feat(FINC-456): allow filter by date range in conciliation report`
- `fix(FINC-789): correct NSU parsing for Rede export`
- `refactor(FINC-101): extract ConciliacaoValidator from ConciliacaoBLL`

## Pull requests

- **Title**: Clear and concise; prefer same style as commits (type + Jira ID + description), e.g. `fix(FINC-123): correct NSU parsing`.
- **Description**: What changed, why, and how to test; link to the Jira card when applicable.
- **Scope**: Keep PRs focused; prefer smaller, reviewable changes over large multi-feature PRs.

## Branch names

- Prefer short, descriptive names; include the Jira ID when possible: `feat/FINC-123-conciliacao-filtro`, `fix/FINC-456-pdv-rede-nsu`.
- Avoid long or vague names.

## Summary

- **Always include the Jira card ID in commits** (e.g. `fix(FINC-123): mensagem do commit`).
- Use conventional commit types with Jira ID as scope.
- Keep PR titles and descriptions informative; link to Jira when applicable.
- Prefer small, focused branches and PRs.

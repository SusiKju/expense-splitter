# Layer 2 — Project Core

> Development principles and critical project rules.

## Development Principles

@.agent-context/base-principles.md

## Critical Rules

- Never share `.env` file contents — ask for specific variable name and value individually
- Always wait for user review before committing changes
- Run tests inside Docker — max 3 fix attempts, then ask the user

## Task Workflow

When the user says "work on AHSR-XXXX":

1. Read `TASKS.md` and find the ticket
2. Create a branch from `main`: `users/mr/AHSR-XXXX-short-title-in-kebab-case`
3. Define the feature and its requirements
4. Check `docs/` for related system documentation
5. Follow established patterns in similar components
6. Add Vitest unit tests for composables and utilities
7. Run tests inside Docker and fix issues (max 3 attempts, then ask)
8. Update documentation in relevant `docs/` files
9. Wait for user review before committing
10. Commit and push after approval

## Branch Naming

```
users/mr/AHSR-1234-short-title-in-kebab-case
```

- User prefix: `mr` (from TASKS.md → Config → user)
- Base branch: `main`
- Title: lowercase kebab-case, max ~5 words

## Testing Strategy

- Framework: Vitest
- Config: `vitest.config.ts`
- Test path: `./tests/vitest/**/*.spec.{js,ts}`
- Run: `make vitest` inside Docker container

## Commit Convention

- Format: `AHSR-XXXX: short description` (Jira ticket prefix)
- PRs: Include ticket number and description in title

## Skills Update

To update agent skills from the dasistweb registry:

```bash
# Run from project root (outside Docker)
cd .ai && make update-skills
```

## Learning Policy

When something new is learned that is not documented:

- Write a markdown file to `docs/learning/`
- Title should summarize what was learned
- The user will review and adjust docs accordingly

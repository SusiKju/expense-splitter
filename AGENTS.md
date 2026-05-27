# AGENTS.md — Project Bootstrap

> All agents MUST read and follow this file.

## Identity

Adam Hall Groupsite | Nuxt 3 / Vue 3 / Storyblok CMS / Algolia | Docker: `ahgs__website`

## Context Architecture

| Layer | File                                      | Content                         |
| ----- | ----------------------------------------- | ------------------------------- |
| 0     | `.agent-context/layer0-agent-workflow.md` | Agent Workflow (shared)         |
| 1     | `.agent-context/layer1-bootstrap.md`      | Project identity, tech stack    |
| 2     | `.agent-context/layer2-project-core.md`   | Dev principles + critical rules |
| 3     | `.agent-context/layer3-guidebook.md`      | Task routing, skills, memory    |

@.agent-context/agent-startup.md
@.agent-context/layer0-agent-workflow.md
@.agent-context/layer1-bootstrap.md
@.agent-context/layer2-project-core.md
@.agent-context/layer3-guidebook.md

## Quick Rules (Always Apply)

- Start every response with **"🚀 Okay here is what I understand:"**
- All `make` commands run inside Docker: `docker exec -it ahgs__website bash`
- Tasks are tracked in `TASKS.md` — when asked to "work on AHSR-XXXX", read it first
- Never share `.env` file contents — ask for specific variable name/value if needed
- Wait for user review before committing any changes

## Compaction Preservation

When compacting context, always preserve:

- List of modified/created files in this session
- Active test/lint commands and their last results
- Unfinished tasks and next steps

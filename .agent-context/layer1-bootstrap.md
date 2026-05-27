# Layer 1 — Bootstrap

> Project identity, architecture rules, and agent coordination.

## Identity

**Adam Hall Groupsite** — Nuxt 3 corporate website with Storyblok CMS, Algolia search, and multi-language support.

- **Framework:** Nuxt 3 / Vue 3 / TypeScript
- **CMS:** Storyblok
- **Search:** Algolia
- **i18n:** @nuxtjs/i18n
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest

## Docker

- Container: `ahgs__website`
- Exec pattern: `docker exec -it ahgs__website bash`
- Run commands inside container: `docker exec -it ahgs__website bash -c 'COMMAND'`

## Domains

- Local Dev: `https://groupsite-dev.diwc.dev`
- Production: `https://adamhall.com`

## Command Runner

All `make` commands must be run inside the Docker container:

```bash
docker exec -it ahgs__website bash
```

## Excluded Directories

- `.env`, `.env.*`
- `node_modules/`
- `public/`

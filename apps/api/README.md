# Ferien Budget — Backend (`apps/api`)

Django 5 + DRF backend for the Ferien Budget app. Postgres 18 + pgvector.
Managed with [uv](https://docs.astral.sh/uv/).

Phase 1 (this): project skeleton, `Vacation` + `Expense` models mirrored from
the app's Drizzle schema, health + OpenAPI endpoints. **No auth or sync yet** —
those are Phase 2 (accounts) and Phase 3 (field-based merge sync).

## Local development

The easiest way is the root dev script, which starts Postgres, applies
migrations automatically, and runs both the API and the Expo bundler:

```bash
# from the repo root
pnpm dev              # Postgres + Django (auto-migrate) + Metro
pnpm dev:backend      # just Postgres + Django
pnpm dev:clear        # everything, with the Metro cache cleared
```

Or drive the backend by hand:

```bash
# 1. Start Postgres 18 + pgvector (from the repo root)
docker compose -f infra/docker-compose.yml up -d

# 2. Configure env
cd apps/api
cp .env.example .env        # defaults already point at the docker Postgres

# 3. Install deps + migrate + run
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
```

Then:

- Health:  http://127.0.0.1:8000/api/health/
- OpenAPI:  http://127.0.0.1:8000/api/schema/
- Swagger UI:  http://127.0.0.1:8000/api/docs/
- Admin:  http://127.0.0.1:8000/admin/  (`uv run python manage.py createsuperuser`)

## Tests

Tests run against the **same engine as production — Postgres 18 + pgvector**
(the docker container), never SQLite. Django builds a throwaway `test_vacation`
database there and runs every migration into it.

```bash
pnpm test:api          # from repo root (reuses the test DB, fast)
pnpm test:api:fresh    # rebuild the test DB (after a schema/migration change)
```

## Checks

```bash
uv run ruff check .          # lint
uv run pytest                # tests
uv run python manage.py check
```

## Notes

- `core.BaseModel` gives every entity a UUID PK, `created_at`/`updated_at`, and
  a soft-delete `deleted_at` — the columns the sync layer will need.
- The OpenAPI schema at `/api/schema/` is the contract from which the mobile
  TypeScript client will be generated (`packages/api-client`, later phase).
- Secrets: `.env` is git-ignored. SOPS-encrypted secrets are being introduced
  team-wide — coordinate before committing any secret material.

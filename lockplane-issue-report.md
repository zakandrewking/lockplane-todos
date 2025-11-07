# Lockplane libSQL/Turso Support Issues

## Environment

- **Lockplane Version**: `dev` (commit: 6fb458e, built: 2025-11-01T19:11:52Z)
- **Database**: Turso (remote libSQL)
- **Connection String**: `libsql://[hostname].turso.io?authToken=[token]`
- **Shadow Database**: `file:.lockplane/shadow.db`
- **OS**: macOS (Darwin 25.0.0)

## Summary

Testing Lockplane's new libSQL support with Turso encountered several issues:
1. SQL syntax errors with DEFAULT clauses
2. JSON parse error during migration execution
3. Shadow DB validation issues with existing tables

## What's Working ✅

- Connection to Turso with `libsql://` URLs and `authToken` query parameter
- Schema validation: `lockplane validate sql schema/`
- Database introspection: `lockplane introspect`
- Migration plan generation with SQLite limitation detection
- Correctly identifies SQLite limitations (e.g., ALTER COLUMN restrictions)

## Issues Encountered

### Issue 1: DEFAULT Clause Syntax Errors

**Schema with `datetime()` function:**
```sql
CREATE TABLE users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at text NOT NULL DEFAULT (datetime('now'))
);
```

**Error:**
```
❌ Migration failed: dry-run validation failed: shadow DB step 0 (Create table users) failed:
SQL logic error: near "(": syntax error (1)
```

**Schema with `CURRENT_TIMESTAMP`:**
```sql
CREATE TABLE users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at text NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Error:**
```
❌ Migration failed: dry-run validation failed: shadow DB step 0 (Create table sessions) failed:
SQL logic error: near "DEFAULT": syntax error (1)
```

**Workaround:** Removed DEFAULT clauses entirely from schema.

### Issue 2: JSON Parse Error During Migration

**Command:**
```bash
lockplane apply --auto-approve --skip-shadow --target-environment local --schema schema/todos.lp.sql
```

**Error:**
```
❌ Migration failed: step 2 failed: failed to execute SQL:
error code 400: JSON parse error: invalid value: integer `-1`, expected u32 at line 1 column 212

Errors:
  - step 2 (SQLite limitation: Cannot add foreign key sessions_fk to existing table sessions.
    Foreign keys must be defined at table creation.) failed: failed to execute SQL:
    error code 400: JSON parse error: invalid value: integer `-1`, expected u32 at line 1 column 212
```

**Context:**
- Step 2 is a comment/no-op about SQLite foreign key limitations
- Error occurs even with `--skip-shadow` flag
- The migration plan correctly identifies this as a limitation:
  ```
  3. SQLite limitation: Cannot add foreign key sessions_fk to existing table sessions.
     Foreign keys must be defined at table creation.
     SQL: -- SQLite limitation: Cannot add foreign key sessions_fk to existing table sessions...
  ```

### Issue 3: Shadow DB Validation with Existing Tables

**Scenario:**
- Target database (Turso) has existing tables: `todos`, `projects`
- Shadow database (local SQLite) is empty
- Migration plan includes steps to modify existing tables

**Error:**
```
❌ Migration failed: dry-run validation failed: shadow DB step 5 (Add column user_id to table todos) failed:
SQL logic error: no such table: todos (1)
```

**Migration Plan Shows:**
```
6. Add column user_id to table projects
   SQL: ALTER TABLE projects ADD COLUMN user_id text NOT NULL
...
13. Add column user_id to table todos
   SQL: ALTER TABLE todos ADD COLUMN user_id text NOT NULL
```

**Issue:** Shadow DB doesn't have the existing tables, so validation fails when trying to ALTER them.

## Reproduction Steps

1. Set up Turso database with existing tables:
   ```bash
   turso db create test-lockplane
   ```

2. Configure `.env.local`:
   ```env
   DATABASE_URL=libsql://[hostname].turso.io?authToken=[token]
   SHADOW_DATABASE_URL=file:.lockplane/shadow.db
   ```

3. Create `lockplane.toml`:
   ```toml
   default_environment = "local"

   [environments.local]
     description = "Local development with Turso"
   ```

4. Create schema file `schema/test.lp.sql`:
   ```sql
   CREATE TABLE users (
     id text PRIMARY KEY,
     email text NOT NULL UNIQUE,
     created_at text NOT NULL
   );

   CREATE TABLE sessions (
     id text PRIMARY KEY,
     user_id text NOT NULL,
     expires_at text NOT NULL,
     created_at text NOT NULL,
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

5. Validate and apply:
   ```bash
   lockplane validate sql schema/test.lp.sql  # ✅ Works
   lockplane apply --auto-approve --target-environment local --schema schema/test.lp.sql  # ❌ Fails
   ```

## Expected Behavior

1. DEFAULT clauses should work with SQLite-compatible syntax
2. Migration steps marked as "SQLite limitation" comments should not attempt execution
3. Shadow DB validation should either:
   - Copy existing tables from target to shadow before testing, OR
   - Skip validation for ALTER operations on tables that don't exist in shadow

## Actual Behavior

1. DEFAULT clauses cause syntax errors
2. Comment-only migration steps trigger JSON parse errors
3. Shadow DB validation fails on non-existent tables

## Workarounds Attempted

- ✅ Removed DEFAULT clauses from schema
- ❌ Used `--skip-shadow` flag (still gets JSON parse error)
- ❌ Changed DEFAULT syntax from `datetime('now')` to `CURRENT_TIMESTAMP`

## Additional Context

This testing is to build an authentication system with:
- User management (users table)
- Session management (sessions table)
- Magic link authentication (login_tokens table)
- Adding user_id to existing todos/projects tables

The libSQL support is greatly appreciated! Happy to provide additional debugging information or test fixes.

## Diagnostic Output

### Introspection (Working ✅)
```bash
$ lockplane introspect --source-environment local --format json
```
Returns valid JSON with table schemas.

### Validation (Working ✅)
```bash
$ lockplane validate sql schema/todos.lp.sql
✓ SQL schema is valid: schema/todos.lp.sql
```

### Migration Plan Generation (Working ✅)
Correctly generates 20-step plan with SQLite limitations noted.

### Migration Execution (Failing ❌)
JSON parse error at step 2.

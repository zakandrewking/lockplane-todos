import { test } from 'node:test'
import assert from 'node:assert/strict'

import { validateLpSql } from '../lib/lpSqlValidator'

test('allows purely declarative CREATE TABLE statements', () => {
  const sql = `
    CREATE TABLE todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0
    );
  `

  const issues = validateLpSql(sql)

  assert.equal(issues.length, 0)
})

test('flags CREATE OR REPLACE usage', () => {
  const sql = `
    CREATE OR REPLACE VIEW public.todos_active AS
    SELECT * FROM todos WHERE completed = 0;
  `

  const issues = validateLpSql(sql)
  const createOrReplace = issues.find((issue) => issue.code === 'CREATE_OR_REPLACE')

  assert.ok(createOrReplace, 'Expected CREATE OR REPLACE to be flagged')
  assert.equal(createOrReplace?.line, 2)
  assert.match(createOrReplace?.message ?? '', /must not use CREATE OR REPLACE/)
})

test('flags DROP statements even when mixed with other commands', () => {
  const sql = `
    CREATE TABLE todos_archive AS SELECT * FROM todos;
    DROP TABLE todos;
  `

  const issues = validateLpSql(sql)
  const dropIssue = issues.find((issue) => issue.code === 'DROP_STATEMENT')

  assert.ok(dropIssue, 'Expected DROP statement to be flagged')
  assert.equal(dropIssue?.line, 3)
})

test('flags conditional IF NOT EXISTS clauses', () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY
    );
  `

  const issues = validateLpSql(sql)
  const conditional = issues.find((issue) => issue.code === 'CONDITIONAL_DEFINITION')

  assert.ok(conditional, 'Expected IF NOT EXISTS to be flagged')
  assert.equal(conditional?.line, 2)
})

test('ignores disallowed keywords inside comments', () => {
  const sql = `
    -- CREATE OR REPLACE TABLE should be ignored in comments
    /* DROP TABLE todos; */
    CREATE TABLE todos (
      id TEXT PRIMARY KEY
    );
  `

  const issues = validateLpSql(sql)

  assert.equal(
    issues.length,
    0,
    `Expected no issues but received: ${JSON.stringify(issues, null, 2)}`
  )
})

test('reports transaction statements and column drops', () => {
  const sql = `
    BEGIN;
    ALTER TABLE todos DROP COLUMN archived_at;
    COMMIT;
  `

  const issues = validateLpSql(sql)

  assert.deepStrictEqual(issues.map((issue) => issue.code), [
    'TRANSACTION_CONTROL',
    'ALTER_DROP',
    'TRANSACTION_CONTROL',
  ])
})

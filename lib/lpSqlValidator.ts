export type LpSqlIssue = {
  code:
    | 'CREATE_OR_REPLACE'
    | 'DROP_STATEMENT'
    | 'TRANSACTION_CONTROL'
    | 'CONDITIONAL_DEFINITION'
    | 'ALTER_DROP'
  message: string
  line: number
  column: number
  snippet: string
}

type Pattern = {
  code: LpSqlIssue['code']
  message: string
  regex: RegExp
}

const PATTERNS: Pattern[] = [
  {
    code: 'CREATE_OR_REPLACE',
    message:
      'Declarative .lp.sql files must not use CREATE OR REPLACE statements. Remove OR REPLACE or split into separate migrations.',
    regex: /\bCREATE\s+OR\s+REPLACE\b/gi,
  },
  {
    code: 'DROP_STATEMENT',
    message:
      'Declarative .lp.sql files must not include DROP statements. Use migrations to drop schema objects.',
    regex: /\bDROP\s+(TABLE|SCHEMA|VIEW|INDEX|SEQUENCE|FUNCTION|TRIGGER)\b/gi,
  },
  {
    code: 'TRANSACTION_CONTROL',
    message:
      'Declarative .lp.sql files must not include transaction control statements such as BEGIN, COMMIT, or ROLLBACK.',
    regex: /\b(BEGIN|COMMIT|ROLLBACK)\b/gi,
  },
  {
    code: 'CONDITIONAL_DEFINITION',
    message:
      'Declarative .lp.sql files must not use conditional clauses like IF EXISTS or IF NOT EXISTS.',
    regex: /\bIF\s+(NOT\s+)?EXISTS\b/gi,
  },
  {
    code: 'ALTER_DROP',
    message:
      'Declarative .lp.sql files must not drop columns via ALTER TABLE ... DROP COLUMN.',
    regex: /\bALTER\s+TABLE\b[\s\S]*?\bDROP\s+COLUMN\b/gi,
  },
]

export function validateLpSql(sql: string): LpSqlIssue[] {
  const sanitized = stripComments(sql)
  const issues: LpSqlIssue[] = []
  const seen = new Set<string>()

  for (const pattern of PATTERNS) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)

    while ((match = regex.exec(sanitized))) {
      const index = match.index
      const key = `${pattern.code}:${index}`
      if (seen.has(key)) continue
      seen.add(key)

      const { line, column, snippet } = positionForIndex(sql, index)
      issues.push({
        code: pattern.code,
        message: pattern.message,
        line,
        column,
        snippet,
      })
    }
  }

  return issues.sort((a, b) => a.line - b.line || a.column - b.column)
}

function stripComments(sql: string): string {
  // Replace comments with spaces to preserve indexes for later position lookups.
  return sql
    .replace(/--[^\n]*/g, (comment) => ' '.repeat(comment.length))
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => ' '.repeat(comment.length))
}

function positionForIndex(sql: string, index: number) {
  const prefix = sql.slice(0, index)
  const lines = prefix.split(/\r?\n/)
  const line = lines.length
  const column = lines[lines.length - 1].length + 1

  const lineText = getLine(sql, line).trim()

  return { line, column, snippet: lineText }
}

function getLine(sql: string, lineNumber: number): string {
  const lines = sql.split(/\r?\n/)
  return lines[lineNumber - 1] ?? ''
}

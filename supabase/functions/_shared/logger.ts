/**
 * Structured logger for Supabase edge functions.
 * Every log line is JSON so Supabase log explorer can filter by field.
 *
 * Usage:
 *   import { logger } from '../_shared/logger.ts'
 *   const log = logger('generate-recipe')
 *   log.info('user authenticated', { userId })
 *   log.error('claude parse failed', { raw: rawText.slice(0, 200) })
 */

type Level = 'info' | 'warn' | 'error'

interface LogEntry {
  ts: string
  level: Level
  fn: string
  msg: string
  [key: string]: unknown
}

function emit(level: Level, fn: string, msg: string, ctx?: Record<string, unknown>) {
  const entry: LogEntry = {
    ts:    new Date().toISOString(),
    level,
    fn,
    msg,
    ...ctx,
  }
  // Supabase captures stdout/stderr — use console.error for warn/error so they
  // appear in the "errors" tab, and console.log for info.
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export function logger(functionName: string) {
  return {
    info:  (msg: string, ctx?: Record<string, unknown>) => emit('info',  functionName, msg, ctx),
    warn:  (msg: string, ctx?: Record<string, unknown>) => emit('warn',  functionName, msg, ctx),
    error: (msg: string, ctx?: Record<string, unknown>) => emit('error', functionName, msg, ctx),
  }
}

/** Returns a short random request ID for tracing across log lines */
export function requestId(): string {
  return Math.random().toString(36).slice(2, 9)
}

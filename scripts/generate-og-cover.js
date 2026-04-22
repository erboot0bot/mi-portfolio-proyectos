#!/usr/bin/env node
/**
 * generate-og-cover.js — Genera la imagen Open Graph del portfolio (1200×630px)
 *
 * Uso:
 *   node scripts/generate-og-cover.js
 *   node scripts/generate-og-cover.js --force   # regenera aunque ya exista
 *
 * Guarda en: public/og-cover.webp
 */

import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─── Logger ───────────────────────────────────────────────────────────────────

const log = {
  info:    (msg) => console.log(`\x1b[34m→\x1b[0m [${new Date().toISOString()}] ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m [${new Date().toISOString()}] ${msg}`),
  error:   (msg) => console.error(`\x1b[31m✗\x1b[0m [${new Date().toISOString()}] ${msg}`),
}

// ─── CLI args ─────────────────────────────────────────────────────────────────

const force = process.argv.includes('--force')
const outFile = join(ROOT, 'public', 'og-cover.webp')

if (!force && existsSync(outFile)) {
  log.info('og-cover.webp ya existe en public/')
  log.info('Usa --force para regenerarla')
  process.exit(0)
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

const PROMPT = [
  'Minimalist dark developer portfolio cover.',
  'Abstract code and neural network nodes glowing in deep navy background.',
  'Subtle orange accent lines (#f97316).',
  'Clean geometric composition, cinematic lighting, no text, no logos,',
  'ultra-wide 19:6 aspect ratio, professional quality.',
].join(' ')

const encodedPrompt = encodeURIComponent(PROMPT)
const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&seed=42`

log.info('Generando og-cover...')

const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 20000)

let res
try {
  res = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
} catch (err) {
  clearTimeout(timeout)
  if (err.name === 'AbortError') {
    log.error('Timeout: Pollinations.ai no respondió en 20 segundos')
  } else {
    log.error(`Error de red: ${err.message}`)
  }
  process.exit(1)
}

if (!res.ok) {
  log.error(`Error de Pollinations.ai: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const contentType = res.headers.get('content-type') ?? ''
if (!contentType.startsWith('image/')) {
  log.error(`Respuesta inesperada (content-type: ${contentType})`)
  process.exit(1)
}

// ─── Save ─────────────────────────────────────────────────────────────────────

const buffer = Buffer.from(await res.arrayBuffer())
writeFileSync(outFile, buffer)
log.success(`Guardado en public/og-cover.webp (${(buffer.length / 1024).toFixed(1)} KB)`)

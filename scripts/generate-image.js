#!/usr/bin/env node
/**
 * generate-image.js — Genera una imagen de portada usando Pollinations.ai (sin API key)
 *
 * Uso:
 *   node scripts/generate-image.js --slug <slug> --description "<descripción>"
 *   node scripts/generate-image.js --slug <slug>                      # usa descripción de projects.js
 *   node scripts/generate-image.js --slug <slug> --force              # regenera aunque ya exista
 *
 * Qué hace:
 *   1. Construye el prompt con --description (o descripción del proyecto en projects.js)
 *   2. Llama a https://image.pollinations.ai/prompt/{prompt} — sin registro, sin API key
 *   3. Guarda la imagen en public/projects/{slug}/cover.webp
 *   4. Actualiza el campo images[] en src/data/projects.js automáticamente
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ─── Logger ───────────────────────────────────────────────────────────────────

const log = {
  info:    (msg) => console.log(`\x1b[34m→\x1b[0m [${new Date().toISOString()}] ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m [${new Date().toISOString()}] ${msg}`),
  warn:    (msg) => console.warn(`\x1b[33m⚠\x1b[0m [${new Date().toISOString()}] ${msg}`),
  error:   (msg) => console.error(`\x1b[31m✗\x1b[0m [${new Date().toISOString()}] ${msg}`),
}

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

function getArg(flag) {
  const idx = args.indexOf(flag)
  return idx !== -1 ? args[idx + 1] ?? null : null
}

const slug = getArg('--slug')
const descArg = getArg('--description')
const force = args.includes('--force')

if (!slug) {
  log.error('Uso: node scripts/generate-image.js --slug <slug> [--description "<texto>"] [--force]')
  process.exit(1)
}

// ─── Load project ─────────────────────────────────────────────────────────────

const projectsUrl = pathToFileURL(join(ROOT, 'src/data/projects.js')).href
const { projects } = await import(projectsUrl)

const project = projects.find(p => p.slug === slug)
if (!project) {
  log.error(`Slug "${slug}" no encontrado en projects.js`)
  log.error(`Slugs disponibles: ${projects.map(p => p.slug).join(', ')}`)
  process.exit(1)
}

log.info(`Proyecto: ${project.title}`)

// ─── Skip if already has image ────────────────────────────────────────────────

const outDir = join(ROOT, 'public', 'projects', slug)
const outFile = join(outDir, 'cover.webp')
const publicPath = `/projects/${slug}/cover.webp`

if (!force && existsSync(outFile)) {
  log.info(`Imagen ya existe en public/projects/${slug}/cover.webp`)
  log.info('Usa --force para regenerarla')
  process.exit(0)
}

// ─── Build prompt ─────────────────────────────────────────────────────────────

const description = descArg ?? project.description
const techList = project.technologies.slice(0, 5).join(', ')

const prompt = [
  `Dark-themed developer portfolio cover for project "${project.title}".`,
  description,
  `Stack: ${techList}.`,
  `Minimal modern UI, dark background, subtle code or interface elements,`,
  `cinematic lighting, professional quality, no text overlays, 16:9.`,
].join(' ')

log.info(`Prompt: ${prompt}`)

// ─── Fetch from Pollinations.ai ───────────────────────────────────────────────

const encodedPrompt = encodeURIComponent(prompt)
const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${Date.now()}`

log.info('Llamando a Pollinations.ai...')

const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 15000)

let res
try {
  res = await fetch(url, { signal: controller.signal })
  clearTimeout(timeout)
} catch (err) {
  clearTimeout(timeout)
  if (err.name === 'AbortError') {
    log.error('Timeout: Pollinations.ai no respondió en 15 segundos')
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

// ─── Save image ───────────────────────────────────────────────────────────────

const buffer = Buffer.from(await res.arrayBuffer())
mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, buffer)
log.success(`Guardado: public/projects/${slug}/cover.webp (${(buffer.length / 1024).toFixed(1)} KB)`)

// ─── Update projects.js ───────────────────────────────────────────────────────

const projectsPath = join(ROOT, 'src/data/projects.js')
let source = readFileSync(projectsPath, 'utf8')

const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const pattern = new RegExp(
  `(slug:\\s*['"]${escapedSlug}['"][\\s\\S]{0,1000}?images:\\s*)\\[[^\\]]*\\]`
)

if (!pattern.test(source)) {
  log.warn('No se pudo localizar el campo images en projects.js.')
  log.warn(`Añade manualmente:  images: ['${publicPath}']`)
} else {
  const alreadyHas = source.match(pattern)?.[0]?.includes(publicPath)
  if (alreadyHas) {
    log.info('projects.js ya tiene esta imagen referenciada.')
  } else {
    source = source.replace(pattern, `$1['${publicPath}']`)
    writeFileSync(projectsPath, source)
    log.success(`Actualizado projects.js → images: ['${publicPath}']`)
  }
}

log.success('Listo.')

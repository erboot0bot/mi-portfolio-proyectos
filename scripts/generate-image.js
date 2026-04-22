#!/usr/bin/env node
/**
 * generate-image.js — Genera una imagen de portada usando Pollinations.ai (sin API key)
 *
 * Uso:
 *   node src/scripts/generate-image.js --slug <slug> --description "<descripción>"
 *   node src/scripts/generate-image.js --slug <slug>                      # usa descripción de projects.js
 *   node src/scripts/generate-image.js --slug <slug> --force              # regenera aunque ya exista
 *
 * Qué hace:
 *   1. Construye el prompt con --description (o descripción del proyecto en projects.js)
 *   2. Llama a https://image.pollinations.ai/prompt/{prompt} — sin registro, sin API key
 *   3. Guarda la imagen en public/projects/{slug}/cover.jpg
 *   4. Actualiza el campo images[] en src/data/projects.js automáticamente
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')

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
  console.error('Uso: node src/scripts/generate-image.js --slug <slug> [--description "<texto>"] [--force]')
  process.exit(1)
}

// ─── Load project ─────────────────────────────────────────────────────────────

const projectsUrl = pathToFileURL(join(ROOT, 'src/data/projects.js')).href
const { projects } = await import(projectsUrl)

const project = projects.find(p => p.slug === slug)
if (!project) {
  console.error(`Proyecto no encontrado: "${slug}"`)
  console.error(`Slugs disponibles: ${projects.map(p => p.slug).join(', ')}`)
  process.exit(1)
}

// ─── Skip if already has image ────────────────────────────────────────────────

const outDir = join(ROOT, 'public', 'projects', slug)
const outFile = join(outDir, 'cover.jpg')
const publicPath = `/projects/${slug}/cover.jpg`

if (!force && existsSync(outFile)) {
  console.log(`Ya existe imagen para "${slug}": public/projects/${slug}/cover.jpg`)
  console.log('Usa --force para regenerar.')
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

// ─── Fetch from Pollinations.ai ───────────────────────────────────────────────

const encodedPrompt = encodeURIComponent(prompt)
const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${Date.now()}`

console.log(`\nGenerando imagen para: ${project.title}`)
console.log(`Prompt: ${prompt}`)
console.log(`\nLlamando a Pollinations.ai...`)

const res = await fetch(url)
if (!res.ok) {
  console.error(`Error de Pollinations.ai: ${res.status} ${res.statusText}`)
  process.exit(1)
}

const contentType = res.headers.get('content-type') ?? ''
if (!contentType.startsWith('image/')) {
  console.error(`Respuesta inesperada (content-type: ${contentType})`)
  process.exit(1)
}

// ─── Save image ───────────────────────────────────────────────────────────────

const buffer = Buffer.from(await res.arrayBuffer())
mkdirSync(outDir, { recursive: true })
writeFileSync(outFile, buffer)
console.log(`Guardado: public/projects/${slug}/cover.jpg (${(buffer.length / 1024).toFixed(1)} KB)`)

// ─── Update projects.js ───────────────────────────────────────────────────────

const projectsPath = join(ROOT, 'src/data/projects.js')
let source = readFileSync(projectsPath, 'utf8')

const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const pattern = new RegExp(
  `(slug:\\s*['"]${escapedSlug}['"][\\s\\S]{0,1000}?images:\\s*)\\[[^\\]]*\\]`
)

if (!pattern.test(source)) {
  console.warn('\nAviso: no se pudo localizar el campo images en projects.js.')
  console.warn(`Añade manualmente:  images: ['${publicPath}']`)
} else {
  const alreadyHas = source.match(pattern)?.[0]?.includes(publicPath)
  if (alreadyHas) {
    console.log('projects.js ya tiene esta imagen referenciada.')
  } else {
    source = source.replace(pattern, `$1['${publicPath}']`)
    writeFileSync(projectsPath, source)
    console.log(`Actualizado projects.js → images: ['${publicPath}']`)
  }
}

console.log('\n✓ Listo.\n')

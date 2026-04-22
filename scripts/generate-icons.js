import sharp from 'sharp'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const icons = ['icon-base', 'icon-shopping', 'icon-calendar', 'icon-menu', 'icon-recipes']
const sizes = [192, 512]

for (const name of icons) {
  const svgPath = join(root, 'public', 'icons', `${name}.svg`)
  const svg = readFileSync(svgPath)
  for (const size of sizes) {
    const outPath = join(root, 'public', 'icons', `${name}-${size}.png`)
    await sharp(svg).resize(size, size).png().toFile(outPath)
    console.log(`✓ ${name}-${size}.png`)
  }
}
console.log('Done.')

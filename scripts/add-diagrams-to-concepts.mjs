import { readFileSync, writeFileSync } from 'fs'

const concepts = JSON.parse(readFileSync('./src/data/concepts.json', 'utf8'))

const PRESETS = {
  104: 'tracking-overview',
  105: 'client-layer',
  107: 'streaming-layer',
}

let updated = 0
for (const c of concepts) {
  if (PRESETS[c.id]) {
    c.diagram = PRESETS[c.id]
    updated++
  }
}

writeFileSync('./src/data/concepts.json', JSON.stringify(concepts, null, 2))
console.log(`Updated ${updated} concepts with diagrams`)

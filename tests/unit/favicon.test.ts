import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { readIco, readPngHeader } from '../icons.ts'

// CA14 — l'ICO de repli contient au moins les tailles 16 × 16 et 32 × 32.
// CA15 — le SVG est dessiné en tracé, sans police ni métadonnées, et pèse au plus 2 000 octets ; l'apple-touch-icon fait 180 × 180.
// La comparaison des dessins (SVG, PNG et ICO) se fait dans le navigateur : tests/e2e/cv.spec.ts. L'affichage dans
// Chrome, Firefox, Safari et iOS se vérifie à la main.

const PUBLIC = new URL('../../public/', import.meta.url)

function read(file: string): Buffer {
  const url = new URL(file, PUBLIC)
  assert.ok(existsSync(url), `public/${file} est manquant`)
  return readFileSync(url)
}

describe('CA14 — public/favicon.ico', () => {
  it('CA14 — est une icône (type 1) qui contient des entrées de 16 × 16 et de 32 × 32', () => {
    const ico = readIco(read('favicon.ico'))
    assert.ok(ico, 'répertoire ICO illisible')
    assert.equal(ico.type, 1, 'type : 1 pour une icône')
    const sizes = ico.entries.map((entry) => `${entry.width}x${entry.height}`)
    assert.ok(sizes.includes('16x16'), `entrées : ${sizes.join(', ')}`)
    assert.ok(sizes.includes('32x32'), `entrées : ${sizes.join(', ')}`)
  })

  it('CA14 — chaque entrée est un PNG dont les dimensions sont celles du répertoire', () => {
    const ico = readIco(read('favicon.ico'))
    assert.ok(ico, 'répertoire ICO illisible')
    assert.ok(ico.entries.length >= 2)
    for (const entry of ico.entries) {
      const label = `entrée ${entry.width}x${entry.height}`
      assert.ok(entry.isPng, `${label} : PNG attendu`)
      const header = readPngHeader(entry.data)
      assert.ok(header, `${label} : en-tête PNG illisible`)
      assert.equal(header.width, entry.width, `${label} : largeur du PNG`)
      assert.equal(header.height, entry.height, `${label} : hauteur du PNG`)
    }
  })
})

describe('CA15 — public/favicon.svg', () => {
  it('CA15 — pèse au plus 2 000 octets', () => {
    const size = read('favicon.svg').length
    assert.ok(size <= 2000, `${size} octets pour un plafond de 2 000`)
  })

  it('CA15 — dessine le « R » en tracé : un <path>, aucune police', () => {
    const svg = read('favicon.svg').toString('utf8')
    assert.match(svg, /<svg[\s>]/, 'élément <svg> absent')
    assert.match(svg, /<path[\s>]/, 'le « R » doit être un <path>')
    for (const forbidden of ['<text', 'font', '<style', 'url(', '<metadata', 'c2pa', '<!--']) {
      assert.ok(!svg.includes(forbidden), `le SVG ne doit pas contenir « ${forbidden} »`)
    }
  })
})

describe('CA15 — public/apple-touch-icon.png', () => {
  it('CA15 — est un PNG de 180 × 180', () => {
    const header = readPngHeader(read('apple-touch-icon.png'))
    assert.ok(header, 'ce n’est pas un PNG')
    assert.equal(`${header.width}x${header.height}`, '180x180')
  })
})

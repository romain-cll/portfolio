import assert from 'node:assert/strict'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { describe, it } from 'node:test'

import { inspectMp4 } from '../mp4.ts'

// CA31 — la vidéo Fraud Engine livrée : poids, définition, codec, ordre des boîtes, durée du montage complet.
// La lecture dans Chrome, Firefox et Safari (macOS et iOS) se vérifie à la main.

const VIDEO = new URL('../../public/media/fraud-engine.mp4', import.meta.url)

function video() {
  assert.ok(existsSync(VIDEO), 'public/media/fraud-engine.mp4 est manquant')
  return { size: statSync(VIDEO).size, info: inspectMp4(readFileSync(VIDEO)) }
}

describe('CA31 — public/media/fraud-engine.mp4', () => {
  it('CA31 — pèse au plus 3 000 000 octets', () => {
    const { size } = video()
    assert.ok(size > 100_000, `fichier trop petit pour un montage de 90 s : ${size} octets`)
    assert.ok(size <= 3_000_000, `${size} octets pour un plafond de 3 000 000`)
  })

  it('CA31 — la piste vidéo est en H.264 (avc1) et ne dépasse pas 720p', () => {
    const { info } = video()
    const track = info.tracks.find((t) => t.handler === 'vide')
    assert.ok(track, 'aucune piste vidéo')
    assert.equal(track.codec, 'avc1')
    assert.ok(track.height > 0, 'hauteur illisible')
    assert.ok(track.height <= 720, `hauteur ${track.height} px`)
    assert.ok(track.width > track.height, `format paysage attendu, ${track.width} × ${track.height}`)
  })

  it('CA31 — le moov précède le mdat (lecture progressive et requêtes Range)', () => {
    const { info } = video()
    const moov = info.topLevel.indexOf('moov')
    const mdat = info.topLevel.indexOf('mdat')
    assert.notEqual(moov, -1, 'boîte moov absente')
    assert.notEqual(mdat, -1, 'boîte mdat absente')
    assert.ok(moov < mdat, `ordre des boîtes : ${info.topLevel.join(', ')}`)
  })

  it('CA31 — provient du montage complet de « Fraud Engine demo.mp4 » : environ 90 s', () => {
    const { info } = video()
    // La source dure 90,66 s.
    assert.ok(info.duration >= 88 && info.duration <= 93, `durée ${info.duration} s`)
  })

  it('CA21 — la démo est muette : aucune piste audio', () => {
    const { info } = video()
    assert.deepEqual(
      info.tracks.filter((t) => t.handler === 'soun'),
      [],
    )
  })
})

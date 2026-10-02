// Lecture minimale d'un fichier MP4 (boîtes ISO BMFF) : de quoi vérifier la vidéo livrée sans outil externe.

export interface Mp4Box {
  type: string
  /** Début du contenu (après l'en-tête). */
  start: number
  /** Fin de la boîte. */
  end: number
  /** Début de la boîte, en-tête compris. */
  offset: number
}

export function readBoxes(buffer: Buffer, from = 0, to = buffer.length): Mp4Box[] {
  const boxes: Mp4Box[] = []
  let offset = from
  while (offset + 8 <= to) {
    let size = buffer.readUInt32BE(offset)
    const type = buffer.toString('latin1', offset + 4, offset + 8)
    let header = 8
    if (size === 1) {
      size = Number(buffer.readBigUInt64BE(offset + 8))
      header = 16
    } else if (size === 0) {
      size = to - offset
    }
    if (size < header) break
    boxes.push({ type, start: offset + header, end: Math.min(offset + size, to), offset })
    offset += size
  }
  return boxes
}

const find = (buffer: Buffer, parent: Mp4Box, type: string) =>
  readBoxes(buffer, parent.start, parent.end).find((box) => box.type === type)

export interface Mp4Track {
  /** `vide`, `soun`… */
  handler: string
  /** Type de la première entrée de `stsd` : `avc1`, `hvc1`, `mp4a`… */
  codec: string
  /** Largeur et hauteur d'affichage (`tkhd`), en pixels. */
  width: number
  height: number
}

export interface Mp4Info {
  /** Types des boîtes de premier niveau, dans l'ordre du fichier. */
  topLevel: string[]
  /** Durée en secondes (`mvhd`). */
  duration: number
  tracks: Mp4Track[]
}

export function inspectMp4(buffer: Buffer): Mp4Info {
  const top = readBoxes(buffer)
  const moov = top.find((box) => box.type === 'moov')
  if (!moov) return { topLevel: top.map((box) => box.type), duration: 0, tracks: [] }

  const mvhd = find(buffer, moov, 'mvhd')
  let duration = 0
  if (mvhd) {
    const version = buffer.readUInt8(mvhd.start)
    const timescale = buffer.readUInt32BE(mvhd.start + (version === 1 ? 20 : 12))
    const length = version === 1 ? Number(buffer.readBigUInt64BE(mvhd.start + 24)) : buffer.readUInt32BE(mvhd.start + 16)
    duration = length / timescale
  }

  const tracks: Mp4Track[] = []
  for (const trak of readBoxes(buffer, moov.start, moov.end).filter((box) => box.type === 'trak')) {
    const tkhd = find(buffer, trak, 'tkhd')
    const mdia = find(buffer, trak, 'mdia')
    if (!tkhd || !mdia) continue
    // Largeur et hauteur : deux entiers 16.16 qui terminent la boîte `tkhd`.
    const width = buffer.readUInt32BE(tkhd.end - 8) / 65536
    const height = buffer.readUInt32BE(tkhd.end - 4) / 65536
    const hdlr = find(buffer, mdia, 'hdlr')
    const handler = hdlr ? buffer.toString('latin1', hdlr.start + 8, hdlr.start + 12) : ''
    const minf = find(buffer, mdia, 'minf')
    const stbl = minf && find(buffer, minf, 'stbl')
    const stsd = stbl && find(buffer, stbl, 'stsd')
    // `stsd` : version et drapeaux (4), nombre d'entrées (4), puis taille (4) et type (4) de la première entrée.
    const codec = stsd ? buffer.toString('latin1', stsd.start + 12, stsd.start + 16) : ''
    tracks.push({ handler, codec, width, height })
  }
  return { topLevel: top.map((box) => box.type), duration, tracks }
}

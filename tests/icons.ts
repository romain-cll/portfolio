// Lecture minimale d'un répertoire ICO et de l'en-tête d'un PNG : de quoi vérifier les icônes livrées sans outil externe.
// Ce module ne dépend d'aucun outil de test, il se charge aussi bien depuis `node --test` que depuis Playwright.

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

export interface PngHeader {
  width: number
  height: number
  bitDepth: number
  /** 0 niveaux de gris, 2 RVB, 3 palette, 4 gris + alpha, 6 RVBA. */
  colorType: number
}

/** En-tête IHDR d'un PNG, ou `null` si le tampon n'en est pas un. */
export function readPngHeader(buffer: Buffer): PngHeader | null {
  if (buffer.length < 33 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return null
  if (buffer.toString('latin1', 12, 16) !== 'IHDR') return null
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bitDepth: buffer.readUInt8(24),
    colorType: buffer.readUInt8(25),
  }
}

export interface IcoEntry {
  /** 256 quand l'octet de l'en-tête vaut 0. */
  width: number
  height: number
  bitsPerPixel: number
  /** Octets de l'image de l'entrée. */
  data: Buffer
  /** Vrai si l'image est un PNG (cas des icônes modernes), faux pour un BMP. */
  isPng: boolean
}

export interface IcoInfo {
  /** 1 pour une icône, 2 pour un curseur. */
  type: number
  entries: IcoEntry[]
}

/** Répertoire d'un fichier ICO : `ICONDIR` (6 octets) puis une entrée de 16 octets par image. */
export function readIco(buffer: Buffer): IcoInfo | null {
  if (buffer.length < 6 || buffer.readUInt16LE(0) !== 0) return null
  const type = buffer.readUInt16LE(2)
  const count = buffer.readUInt16LE(4)
  const entries: IcoEntry[] = []
  for (let i = 0; i < count; i++) {
    const at = 6 + i * 16
    if (at + 16 > buffer.length) return null
    const size = buffer.readUInt32LE(at + 8)
    const offset = buffer.readUInt32LE(at + 12)
    if (offset + size > buffer.length) return null
    const data = buffer.subarray(offset, offset + size)
    entries.push({
      width: buffer.readUInt8(at) || 256,
      height: buffer.readUInt8(at + 1) || 256,
      bitsPerPixel: buffer.readUInt16LE(at + 6),
      data,
      isPng: data.subarray(0, 8).equals(PNG_SIGNATURE),
    })
  }
  return { type, entries }
}

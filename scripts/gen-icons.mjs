import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public')
mkdirSync(outDir, { recursive: true })

/* ---------- minimal PNG encoder ---------- */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4)
  out.writeUInt32BE(data.length, 0)
  out.write(type, 4, 'ascii')
  data.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
  return out
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

/* ---------- renderer: play button on dark tile ---------- */

const lerp = (a, b, t) => a + (b - a) * t

function sign(p1, p2, p3) {
  return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])
}

function inTriangle(pt, v1, v2, v3) {
  const d1 = sign(pt, v1, v2)
  const d2 = sign(pt, v2, v3)
  const d3 = sign(pt, v3, v1)
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0
  return !(hasNeg && hasPos)
}

function renderIcon(size, { maskable = false } = {}) {
  const bg = [10, 10, 10]
  const cTop = [10, 132, 255]
  const cBot = [51, 149, 255]
  const buf = Buffer.alloc(size * size * 4)
  const cx = size / 2
  const cy = size / 2
  const s = size * (maskable ? 0.26 : 0.3)
  const v1 = [cx - s * 0.82, cy - s]
  const v2 = [cx - s * 0.82, cy + s]
  const v3 = [cx + s, cy]
  const cornerR = maskable ? 0 : size * 0.2
  const SS = 2

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let tri = 0
      let rect = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = x + (sx + 0.5) / SS
          const py = y + (sy + 0.5) / SS
          if (inTriangle([px, py], v1, v2, v3)) tri++
          const ddx = Math.abs(px - cx) - (size / 2 - cornerR)
          const ddy = Math.abs(py - cy) - (size / 2 - cornerR)
          if (maskable || ddx <= 0 || ddy <= 0 || Math.hypot(Math.max(ddx, 0), Math.max(ddy, 0)) < cornerR) {
            rect++
          }
        }
      }
      const triCov = tri / (SS * SS)
      const rectCov = rect / (SS * SS)
      const i = (y * size + x) * 4
      if (rectCov <= 0) {
        buf.writeUInt32BE(0, i)
        continue
      }
      const t = y / size
      const r = lerp(bg[0], lerp(cTop[0], cBot[0], t), triCov)
      const g = lerp(bg[1], lerp(cTop[1], cBot[1], t), triCov)
      const b = lerp(bg[2], lerp(cTop[2], cBot[2], t), triCov)
      buf[i] = Math.round(r)
      buf[i + 1] = Math.round(g)
      buf[i + 2] = Math.round(b)
      buf[i + 3] = Math.round(255 * rectCov)
    }
  }
  return encodePng(size, size, buf)
}

const files = [
  ['pwa-192.png', renderIcon(192)],
  ['pwa-512.png', renderIcon(512)],
  ['pwa-maskable-512.png', renderIcon(512, { maskable: true })],
  ['apple-touch-icon.png', renderIcon(180)],
]

for (const [name, png] of files) {
  writeFileSync(join(outDir, name), png)
  console.log(`wrote public/${name}`)
}

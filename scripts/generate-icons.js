// Genere des icones PWA placeholder (carre sage uni + coin de maison blanc
// formant un N) sans dependance externe, via l'encodeur PNG minimal ci-dessous.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SAGE = [87, 118, 67]; // #577643
const WHITE = [255, 255, 255];

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/** Coin de maison ouvert formant un N, epaisseur de trait proportionnelle a la taille. */
function isMark(x, y, size) {
  const margin = size * 0.32;
  const stroke = size * 0.1;
  const top = margin;
  const bottom = size - margin;
  const left = margin;
  const right = size - margin;

  const onLeftBar = x >= left && x <= left + stroke && y >= top && y <= bottom;
  const onRightBar = x >= right - stroke && x <= right && y >= top && y <= bottom;

  // Diagonale reliant bas-gauche a haut-droit.
  const t = (x - left) / (right - left);
  const diagY = bottom - t * (bottom - top);
  const onDiagonal =
    x >= left && x <= right && Math.abs(y - diagY) <= stroke * 0.75;

  return onLeftBar || onRightBar || onDiagonal;
}

function generatePng(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const color = isMark(x, y, size) ? WHITE : SAGE;
      const offset = rowStart + 1 + x * 4;
      raw[offset] = color[0];
      raw[offset + 1] = color[1];
      raw[offset + 2] = color[2];
      raw[offset + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type: RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const idat = zlib.deflateSync(raw, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const sizes = [
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 32, name: "favicon-32.png" },
];

for (const { size, name } of sizes) {
  fs.writeFileSync(path.join(outDir, name), generatePng(size));
  console.log(`generated ${name}`);
}

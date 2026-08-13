// Genere les icones PWA directement depuis le trace vectoriel Claude Design
// (rendu natif a chaque taille, pas d'upscale d'un raster source).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

function iconSvg({ size, radius, bg, houseColor, leafColor }) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="${radius}" fill="${bg}" />
  <g transform="translate(22,22) scale(0.56)">
    <path d="M50 4 L96 44 L84 44 L84 58 L100 58 L100 70 L84 70 L84 92 L16 92 L16 44 L4 44 Z" fill="${houseColor}" />
    <rect x="38" y="58" width="10" height="10" rx="2" fill="${bg}" />
    <rect x="52" y="58" width="10" height="10" rx="2" fill="${bg}" />
    <rect x="38" y="72" width="10" height="10" rx="2" fill="${bg}" />
    <rect x="52" y="72" width="10" height="10" rx="2" fill="${bg}" />
  </g>
  <g transform="translate(62,14) scale(0.7) rotate(18,20,20)">
    <path d="M2 34 C2 14 18 2 38 2 C38 22 22 34 2 34 Z" fill="${leafColor}" />
    <path d="M6 32 C14 24 22 16 34 6" stroke="${bg}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.55" />
  </g>
</svg>`;
}

const OUT = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(OUT, { recursive: true });

const base = {
  bg: "#0B4D88",
  houseColor: "#ffffff",
  leafColor: "#34C759",
};

// rx est exprime dans le repere du viewBox (0-100), identique quelle que
// soit la taille finale en pixels : 24 = "border-radius: 24px" sur un
// conteneur 100x100 dans le design d'origine.
const CORNER_RADIUS = 24;

const targets = [
  { size: 192, name: "icon-192.png" },
  { size: 512, name: "icon-512.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 32, name: "favicon-32.png" },
];

(async () => {
  for (const t of targets) {
    const svg = iconSvg({ ...base, size: t.size, radius: CORNER_RADIUS });
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, t.name));
    console.log(`icon: ${t.name} (${t.size}x${t.size})`);
  }
})();

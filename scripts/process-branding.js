// Traite les assets bruts extraits dans branding/ (pack fourni par l'utilisateur)
// vers public/brand (logos, mascotte, icones de fonctionnalites) et
// public/icons (icones PWA). Le dossier branding/ n'est pas commite (source brute).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "branding");
const BRAND_OUT = path.join(ROOT, "public", "brand");
const ICONS_OUT = path.join(ROOT, "public", "icons");

fs.mkdirSync(BRAND_OUT, { recursive: true });
fs.mkdirSync(ICONS_OUT, { recursive: true });

async function copyAs(srcRel, destName, { maxWidth } = {}) {
  const srcPath = path.join(SRC, srcRel);
  const destPath = path.join(BRAND_OUT, destName);
  let img = sharp(srcPath);
  if (maxWidth) {
    img = img.resize({ width: maxWidth, withoutEnlargement: false });
  }
  await img.png({ quality: 90 }).toFile(destPath);
  console.log(`brand: ${destName}`);
}

async function makeIcon(srcRel, size, destName) {
  const srcPath = path.join(SRC, srcRel);
  const destPath = path.join(ICONS_OUT, destName);
  await sharp(srcPath)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(destPath);
  console.log(`icon: ${destName} (${size}x${size})`);
}

async function main() {
  // Logos
  await copyAs("01_logos/nook_logo_principal.png", "logo-principal.png", { maxWidth: 740 });
  await copyAs("01_logos/nook_logo_blanc.png", "logo-blanc.png", { maxWidth: 840 });
  await copyAs("01_logos/nook_symbole_maison.png", "symbole-maison.png", { maxWidth: 540 });

  // Mascotte
  await copyAs("03_mascotte/mascotte_principale.png", "mascotte-principale.png", { maxWidth: 900 });
  await copyAs("03_mascotte/mascotte_tout_est_la.png", "mascotte-tout-est-la.png");
  await copyAs("03_mascotte/mascotte_a_table.png", "mascotte-a-table.png");
  await copyAs("03_mascotte/mascotte_top.png", "mascotte-top.png");

  // Icones de fonctionnalites
  await copyAs("04_feature_icons/icone_courses.png", "feature-courses.png");
  await copyAs("04_feature_icons/icone_stock.png", "feature-stock.png");
  await copyAs("04_feature_icons/icone_peremption.png", "feature-peremption.png");
  await copyAs("04_feature_icons/icone_famille.png", "feature-famille.png");
  await copyAs("04_feature_icons/icone_produits.png", "feature-produits.png");

  // Icones PWA (symbole maison seul, lisible en petite taille)
  await makeIcon("02_app_icons/icon_maison.png", 192, "icon-192.png");
  await makeIcon("02_app_icons/icon_maison.png", 512, "icon-512.png");
  await makeIcon("02_app_icons/icon_maison.png", 180, "apple-touch-icon.png");
  await makeIcon("02_app_icons/icon_maison.png", 32, "favicon-32.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

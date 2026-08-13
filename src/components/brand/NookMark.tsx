/**
 * Symbole maison + feuille, vectorise depuis l'export Claude Design
 * (branding-v2/Nook/NOOK Signaletique v2.dc.html). Toujours net, quelle
 * que soit la taille d'affichage. Reprend la composition d'origine :
 * la feuille deborde legerement en haut a droite de la maison.
 */
export function NookMark({
  className,
  houseColor = "#0B4D88",
  leafColor = "#34C759",
}: {
  className?: string;
  houseColor?: string;
  leafColor?: string;
}) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
        <path
          d="M50 4 L96 44 L84 44 L84 58 L100 58 L100 70 L84 70 L84 92 L16 92 L16 44 L4 44 Z"
          fill={houseColor}
        />
        <rect x="38" y="58" width="10" height="10" rx="2" fill="#fff" />
        <rect x="52" y="58" width="10" height="10" rx="2" fill="#fff" />
        <rect x="38" y="72" width="10" height="10" rx="2" fill="#fff" />
        <rect x="52" y="72" width="10" height="10" rx="2" fill="#fff" />
      </svg>
      <svg
        viewBox="0 0 40 40"
        style={{
          width: "53%",
          height: "53%",
          position: "absolute",
          top: "-18%",
          right: "-21%",
          transform: "rotate(18deg)",
        }}
      >
        <path d="M2 34 C2 14 18 2 38 2 C38 22 22 34 2 34 Z" fill={leafColor} />
        <path
          d="M6 32 C14 24 22 16 34 6"
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}

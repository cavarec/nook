import { cn } from "@/lib/utils";

export type FeatureIconType =
  | "courses"
  | "stock"
  | "produits"
  | "peremption"
  | "famille"
  | "etiquette"
  | "codeBarres"
  | "notification"
  | "parametres";

const CONFIG: Record<FeatureIconType, { bg: string; label: string }> = {
  courses: { bg: "#34C759", label: "Liste de courses" },
  stock: { bg: "#FF9800", label: "Stock maison" },
  produits: { bg: "#2E86DE", label: "Suivi produits" },
  peremption: { bg: "#7E57C2", label: "Dates de péremption" },
  famille: { bg: "#E0578C", label: "En famille" },
  etiquette: { bg: "#2E7D32", label: "Étiquette" },
  codeBarres: { bg: "#F4511E", label: "Code-barres" },
  notification: { bg: "#FF9800", label: "Notification" },
  parametres: { bg: "#00897B", label: "Paramètres" },
};

function Pictogram({ type }: { type: FeatureIconType }) {
  switch (type) {
    case "courses":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <path
            d="M10 14 H24 L32 62 H82 L90 28 H30"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="40" cy="82" r="8" fill="#fff" />
          <circle cx="76" cy="82" r="8" fill="#fff" />
        </svg>
      );
    case "stock":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <path d="M12 32 L50 14 L88 32 L50 50 Z" fill="#fff" />
          <path d="M12 32 V72 L50 90 V50 Z" fill="#fff" opacity="0.78" />
          <path d="M88 32 V72 L50 90 V50 Z" fill="#fff" opacity="0.92" />
        </svg>
      );
    case "produits":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <rect
            x="26"
            y="8"
            width="48"
            height="84"
            rx="10"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
          />
          <line x1="26" y1="42" x2="74" y2="42" stroke="#fff" strokeWidth="8" />
          <line
            x1="38"
            y1="18"
            x2="38"
            y2="30"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1="38"
            y1="52"
            x2="38"
            y2="64"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "peremption":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <rect
            x="10"
            y="18"
            width="80"
            height="72"
            rx="10"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
          />
          <line x1="10" y1="40" x2="90" y2="40" stroke="#fff" strokeWidth="8" />
          <line
            x1="30"
            y1="8"
            x2="30"
            y2="26"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1="70"
            y1="8"
            x2="70"
            y2="26"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M32 64 L45 76 L70 50"
            fill="none"
            stroke="#fff"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "famille":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <circle cx="34" cy="30" r="14" fill="#fff" />
          <path
            d="M10 82 C10 60 20 50 34 50 C48 50 58 60 58 82 Z"
            fill="#fff"
          />
          <circle cx="70" cy="36" r="11" fill="#fff" opacity="0.85" />
          <path
            d="M50 84 C50 66 58 58 70 58 C82 58 90 66 90 84 Z"
            fill="#fff"
            opacity="0.85"
          />
        </svg>
      );
    case "etiquette":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <path
            d="M12 50 L40 18 H82 Q90 18 90 26 V68 Q90 76 82 76 H40 Z"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <circle cx="34" cy="34" r="7" fill="#fff" />
          <rect x="52" y="38" width="10" height="10" rx="2" fill="#fff" />
          <rect x="68" y="38" width="10" height="10" rx="2" fill="#fff" />
          <rect x="52" y="54" width="10" height="10" rx="2" fill="#fff" />
          <rect x="68" y="54" width="10" height="10" rx="2" fill="#fff" />
        </svg>
      );
    case "codeBarres":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <path d="M14 30 V18 Q14 14 18 14 H30" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
          <path d="M70 14 H82 Q86 14 86 18 V30" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
          <path d="M86 70 V82 Q86 86 82 86 H70" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
          <path d="M30 86 H18 Q14 86 14 82 V70" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
          <line x1="30" y1="32" x2="30" y2="68" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          <line x1="42" y1="32" x2="42" y2="68" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
          <line x1="56" y1="32" x2="56" y2="68" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          <line x1="68" y1="32" x2="68" y2="68" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
        </svg>
      );
    case "notification":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <path
            d="M50 10 C36 10 28 22 28 38 V52 L18 66 H82 L72 52 V38 C72 22 64 10 50 10 Z"
            fill="#fff"
          />
          <path
            d="M40 78 Q50 92 60 78"
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "parametres":
      return (
        <svg viewBox="0 0 100 100" style={{ width: "56%", height: "56%" }}>
          <circle cx="50" cy="50" r="20" fill="none" stroke="#fff" strokeWidth="9" />
          <circle cx="50" cy="50" r="7" fill="#fff" />
          <g fill="#fff">
            <rect x="44" y="4" width="12" height="16" rx="3" />
            <rect x="44" y="80" width="12" height="16" rx="3" />
            <rect x="4" y="44" width="16" height="12" rx="3" />
            <rect x="80" y="44" width="16" height="12" rx="3" />
            <g transform="rotate(45 50 50)">
              <rect x="44" y="4" width="12" height="16" rx="3" />
              <rect x="44" y="80" width="12" height="16" rx="3" />
              <rect x="4" y="44" width="16" height="12" rx="3" />
              <rect x="80" y="44" width="16" height="12" rx="3" />
            </g>
          </g>
        </svg>
      );
  }
}

/** Icone de fonctionnalite : pastille coloree + pictogramme, vectorises depuis Claude Design. */
export function FeatureIcon({
  type,
  className,
}: {
  type: FeatureIconType;
  className?: string;
}) {
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full", className)}
      style={{ backgroundColor: CONFIG[type].bg }}
    >
      <Pictogram type={type} />
    </div>
  );
}

export function featureLabel(type: FeatureIconType): string {
  return CONFIG[type].label;
}

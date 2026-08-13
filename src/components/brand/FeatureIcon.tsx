import { cn } from "@/lib/utils";

export type FeatureIconType =
  | "courses"
  | "stock"
  | "produits"
  | "peremption"
  | "famille";

const CONFIG: Record<FeatureIconType, { bg: string; label: string }> = {
  courses: { bg: "#34C759", label: "Liste de courses" },
  stock: { bg: "#FF9800", label: "Stock maison" },
  produits: { bg: "#2E86DE", label: "Suivi produits" },
  peremption: { bg: "#7E57C2", label: "Dates de péremption" },
  famille: { bg: "#E0578C", label: "En famille" },
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

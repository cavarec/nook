export function NookLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NOOK"
    >
      <rect x="3" y="3" width="42" height="42" rx="12" className="fill-sage-600" />
      {/* Coin de maison ouvert formant un N */}
      <path
        d="M15 33V15L33 33V15"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

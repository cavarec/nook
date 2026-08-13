import Image from "next/image";

export function NookLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/icons/icon-192.png"
      alt="NOOK"
      width={192}
      height={192}
      className={className}
      priority
    />
  );
}

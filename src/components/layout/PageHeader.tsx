import Image from "next/image";

export function PageHeader({
  icon,
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <Image src={icon} alt="" width={75} height={75} className="h-10 w-10 shrink-0" />
      )}
      <div>
        <h1 className="text-2xl font-semibold text-mist-900">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

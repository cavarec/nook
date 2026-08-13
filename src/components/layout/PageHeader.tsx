import { FeatureIcon, type FeatureIconType } from "@/components/brand/FeatureIcon";

export function PageHeader({
  icon,
  title,
  subtitle,
}: {
  icon?: FeatureIconType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon && <FeatureIcon type={icon} className="h-10 w-10" />}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-mist-900">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

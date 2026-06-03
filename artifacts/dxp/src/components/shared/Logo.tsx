import { getBranding } from "@/repositories/branding.repository";
import { resolveAssetUrl } from "@/lib/media";

interface LogoProps {
  size?: number;
  className?: string;
  showName?: boolean;
  nameClassName?: string;
  /** Use the dark-background logo variant (for dark surfaces like the sidebar). */
  dark?: boolean;
}

export function Logo({ size = 32, className = "", showName = false, nameClassName = "", dark = false }: LogoProps) {
  const branding = getBranding();
  const src = resolveAssetUrl(dark && branding.logoUrlDark ? branding.logoUrlDark : branding.logoUrl);
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={src}
        alt={branding.companyName}
        width={size}
        height={size}
        className="object-contain flex-shrink-0"
        style={{ width: size, height: size }}
      />
      {showName && (
        <span className={nameClassName || "font-semibold tracking-tight"}>
          {branding.companyName}
        </span>
      )}
    </span>
  );
}

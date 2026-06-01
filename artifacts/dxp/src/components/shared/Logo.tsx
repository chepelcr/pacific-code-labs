import logoSrc from "/logo.png";

interface LogoProps {
  size?: number;
  className?: string;
  showName?: boolean;
  nameClassName?: string;
}

export function Logo({ size = 32, className = "", showName = false, nameClassName = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt="Pacific Code Labs"
        width={size}
        height={size}
        className="object-contain flex-shrink-0"
        style={{ width: size, height: size }}
      />
      {showName && (
        <span className={nameClassName || "font-semibold tracking-tight"}>
          Pacific Code Labs
        </span>
      )}
    </span>
  );
}

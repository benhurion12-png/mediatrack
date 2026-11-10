import Link from "next/link";
import Image from "next/image";

export function BrandLogo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
  return (
    <Link className="brand-logo" href={href} aria-label="MediaTrack — на главную">
      <Image src="/mediatrack-logo.svg" alt="" width={44} height={44} priority />
      {!compact && (
        <span className="brand-logo__text">
          Media<span>Track</span>
        </span>
      )}
    </Link>
  );
}

import Link from "next/link";

export function TurkishFlagSvg({ className = "h-5 w-7" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 200"
      className={`shrink-0 rounded-[3px] shadow-xs ring-1 ring-black/10 ${className}`}
      aria-label="Türk Bayrağı"
      role="img"
    >
      <rect width="300" height="200" fill="#E30A17" />
      <circle cx="100" cy="100" r="50" fill="#FFFFFF" />
      <circle cx="112.5" cy="100" r="40" fill="#E30A17" />
      <polygon
        points="150.83,100 168.10,94.39 168.10,76.22 178.78,90.92 196.06,85.31 185.38,100 196.06,114.69 178.78,109.08 168.10,123.78 168.10,105.61"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 focus:outline-none"
      aria-label="Büyük Akören Köyü Derneği Ana Sayfa"
    >
      <TurkishFlagSvg className={compact ? "h-4 w-6" : "h-5 w-[30px] sm:h-6 sm:w-9"} />
      <span className="flex flex-col leading-none">
        <span className="font-brand text-[19px] font-extrabold tracking-[-0.03em] text-[#191919] transition-opacity group-hover:opacity-75 sm:text-[20px]">
          B.AKÖREN
        </span>
        {!compact && (
          <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#666560]">
            Köyü Derneği • Sivas
          </span>
        )}
      </span>
    </Link>
  );
}

import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex flex-col leading-none focus:outline-none"
      aria-label="Büyük Akören Köyü Derneği Ana Sayfa"
    >
      <span className="font-brand text-[20px] font-extrabold tracking-[-0.03em] text-[#191919] transition-opacity group-hover:opacity-75">
        B.AKÖREN
      </span>
      {!compact && (
        <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#666560]">
          Köyü Derneği • Sivas
        </span>
      )}
    </Link>
  );
}

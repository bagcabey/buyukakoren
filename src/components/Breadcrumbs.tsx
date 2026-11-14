import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo";

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const fullItems: BreadcrumbItem[] = [
    { name: "Ana Sayfa", href: "/" },
    ...items.filter((i) => i.href !== "/"),
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(fullItems)} />
      <nav
        aria-label="Sayfa konumu"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[#666560]"
      >
        {fullItems.map((item, idx) => {
          const isLast = idx === fullItems.length - 1;
          return (
            <span key={item.href + idx} className="inline-flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#a1a09a]" />}
              {isLast ? (
                <span className="font-medium text-[#191919]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-[#191919] hover:underline">
                  {item.name}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}

import Image from "next/image";

export function isOptimizableImageSrc(src: string): boolean {
  const clean = (src || "").trim();
  if (!clean) return false;
  if (clean.startsWith("/") && !clean.startsWith("//")) return true;
  try {
    const parsed = new URL(clean);
    if (
      parsed.hostname.endsWith(".public.blob.vercel-storage.com") ||
      parsed.hostname === "upload.wikimedia.org"
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

interface SmartImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function SmartImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className = "",
}: SmartImageProps) {
  if (!isOptimizableImageSrc(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} className={className} />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 1200}
      height={height || 800}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

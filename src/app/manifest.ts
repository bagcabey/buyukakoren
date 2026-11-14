import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Büyük Akören Köyü Derneği Portalı",
    short_name: "B.Akören",
    description:
      "Sivas Yıldızeli Büyükakören (Büyük Akören) Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği resmî duyuru, faaliyet ve taziye portalı.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e30a17",
    lang: "tr",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

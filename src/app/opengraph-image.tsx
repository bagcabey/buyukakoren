import { ImageResponse } from "next/og";

export const alt = "Büyük Akören Köyü Derneği — Yıldızeli, Sivas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #191919 0%, #2a1818 55%, #7f0d16 100%)",
          color: "#ffffff",
          padding: "56px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "64px",
              height: "44px",
              borderRadius: "6px",
              background: "#E30A17",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.25)",
            }}
          >
            <svg width="48" height="32" viewBox="0 0 300 200">
              <circle cx="100" cy="100" r="50" fill="#FFFFFF" />
              <circle cx="112.5" cy="100" r="40" fill="#E30A17" />
              <polygon
                points="150.83,100 168.10,94.39 168.10,76.22 178.78,90.92 196.06,85.31 185.38,100 196.06,114.69 178.78,109.08 168.10,123.78 168.10,105.61"
                fill="#FFFFFF"
              />
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              B.AKÖREN
            </span>
            <span style={{ fontSize: "14px", color: "#e5e4df", letterSpacing: "0.14em" }}>
              SİVAS • YILDIZELİ • PK 58502
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "960px" }}>
          <div style={{ fontSize: "52px", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
            Büyük Akören Köyü Yardımlaşma, Dayanışma ve Kalkınma Derneği
          </div>
          <div style={{ fontSize: "24px", color: "#e5e4df", lineHeight: 1.4 }}>
            Büyükakören resmî duyuru, faaliyet raporu, vefat & taziye ilanları, köy tarihçesi ve hemşehri iletişim portalı.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.18)",
            paddingTop: "20px",
            fontSize: "18px",
            color: "#d4d3ce",
          }}
        >
          <span>Resmî Bilgi Portalı</span>
          <span>Yıldızeli / Sivas</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#E30A17",
          borderRadius: "36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <svg width="110" height="74" viewBox="0 0 300 200">
          <circle cx="100" cy="100" r="50" fill="#FFFFFF" />
          <circle cx="112.5" cy="100" r="40" fill="#E30A17" />
          <polygon
            points="150.83,100 168.10,94.39 168.10,76.22 178.78,90.92 196.06,85.31 185.38,100 196.06,114.69 178.78,109.08 168.10,123.78 168.10,105.61"
            fill="#FFFFFF"
          />
        </svg>
        <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "6px", letterSpacing: "0.06em" }}>
          AKÖREN
        </div>
      </div>
    ),
    { ...size }
  );
}

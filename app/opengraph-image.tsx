import { ImageResponse } from "next/og";

export const alt = "LifeOnHorse — Global Horse Marketplace & Community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2c1810 0%, #c45c26 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: "-0.02em" }}>
          LifeOnHorse
        </div>
        <div style={{ fontSize: 28, marginTop: 16, opacity: 0.9 }}>
          Global Horse Marketplace & Community
        </div>
      </div>
    ),
    { ...size }
  );
}

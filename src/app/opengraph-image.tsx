import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const alt = "Acadivo — academic help from verified peer helpers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0F172A",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "#1E3A8A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: 38,
            fontWeight: 700,
          }}
        >
          A
        </div>
        <div style={{ color: "#FFFFFF", fontSize: 40, fontWeight: 700 }}>{SITE_NAME}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 66,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Help from a verified academic helper
        </div>
        <div style={{ color: "#94A3B8", fontSize: 32, maxWidth: 900 }}>
          Send your brief, get a written quote, and pay only once it looks right.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 6, borderRadius: 999, background: "#1E3A8A" }} />
        <div style={{ color: "#94A3B8", fontSize: 28 }}>{SITE_URL.replace("https://", "")}</div>
      </div>
    </div>,
    { ...size },
  );
}

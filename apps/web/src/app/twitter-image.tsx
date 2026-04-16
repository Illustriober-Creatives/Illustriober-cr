import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Illustriober Creatives";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(135deg, #0c1117 0%, #121a24 55%, #1f2937 100%)",
          color: "#f8fafc",
          padding: "64px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              background: "#f97316",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            IC
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 22,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#fb923c",
              }}
            >
              Illustriober Creatives
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#cbd5e1",
              }}
            >
              Design, strategy, and engineering in one studio.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 78,
              lineHeight: 1.02,
              fontWeight: 700,
            }}
          >
            Full-stack products built with design precision.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#cbd5e1",
            }}
          >
            Web platforms, mobile apps, UI systems, and delivery strategy.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#94a3b8",
          }}
        >
          <div>illustriober.com</div>
          <div>Next.js • React • Product Design</div>
        </div>
      </div>
    ),
    size,
  );
}

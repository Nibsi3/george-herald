import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#DC2626",
          borderRadius: "12px",
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-1px",
            fontFamily: "Georgia, serif",
          }}
        >
          GH
        </span>
      </div>
    ),
    { ...size }
  );
}

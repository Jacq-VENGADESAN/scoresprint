import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#f7f7f3", color: "#172033", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 42, fontWeight: 800 }}>
        <div style={{ width: 58, height: 58, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "white", background: "#3157d5" }}>A</div>
        Aptileo
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ maxWidth: 950, fontSize: 72, lineHeight: 1.05, letterSpacing: -3, fontWeight: 800 }}>Progresse là où ça compte.</div>
        <div style={{ maxWidth: 850, fontSize: 30, color: "#4b5567" }}>Reading, Listening, erreurs ciblées et progression mesurée pour l’anglais professionnel.</div>
      </div>
      <div style={{ display: "flex", gap: 18, fontSize: 24, color: "#3157d5", fontWeight: 700 }}>Diagnostic gratuit · Paiements uniques · Sans renouvellement automatique</div>
    </div>,
    size
  );
}

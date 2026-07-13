type ScorePoint = {
  central_score: number;
  source: "diagnostic" | "practice" | "mini_exam";
  created_at: string;
};

function sourceLabel(source: ScorePoint["source"]) {
  if (source === "mini_exam") return "Mini-test";
  if (source === "diagnostic") return "Diagnostic";
  return "Séance";
}

export function ScoreCurve({ snapshots }: { snapshots: ScorePoint[] }) {
  const points = [...snapshots].reverse().slice(-8);
  if (points.length < 2) {
    return <div className="score-curve-empty">Deux mesures sont nécessaires pour tracer une évolution.</div>;
  }

  const width = 640;
  const height = 160;
  const paddingX = 22;
  const paddingY = 20;
  const scores = points.map((point) => point.central_score);
  const dataMin = Math.min(...scores);
  const dataMax = Math.max(...scores);
  const spread = Math.max(60, dataMax - dataMin);
  const minScore = Math.max(10, dataMin - spread * 0.35);
  const maxScore = Math.min(990, dataMax + spread * 0.35);
  const yRange = Math.max(1, maxScore - minScore);

  const coordinates = points.map((point, index) => {
    const x = paddingX + (index / Math.max(1, points.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((point.central_score - minScore) / yRange) * (height - paddingY * 2);
    return { ...point, x, y };
  });
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${paddingX},${height - paddingY} ${line} ${width - paddingX},${height - paddingY}`;

  return (
    <div className="score-curve">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Courbe des dernières estimations de score">
        <polygon points={area} className="score-curve-area" />
        <polyline points={line} className="score-curve-line" />
        {coordinates.map((point, index) => (
          <g key={`${point.created_at}-${index}`}>
            <circle cx={point.x} cy={point.y} r="6" className="score-curve-point" />
            <text x={point.x} y={Math.max(13, point.y - 12)} textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">
              {point.central_score}
            </text>
          </g>
        ))}
      </svg>
      <div className="score-curve-labels">
        {coordinates.map((point, index) => (
          <span key={`${point.created_at}-label-${index}`} title={new Date(point.created_at).toLocaleString("fr-FR")}>
            {sourceLabel(point.source)}
          </span>
        ))}
      </div>
    </div>
  );
}

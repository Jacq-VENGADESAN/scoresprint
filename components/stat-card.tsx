export function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {detail ? <div className="stat-label" style={{ marginTop: 4 }}>{detail}</div> : null}
    </div>
  );
}

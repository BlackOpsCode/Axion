"use client";

interface BeamGridProps {
  grid: number[][];
  label: string;
  sublabel: string;
}

export default function BeamGrid({ grid, label, sublabel }: BeamGridProps) {
  return (
    <div className="bento-card flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="label">{label}</div>
        <div className="sublabel">{sublabel}</div>
      </div>
      <div
        className="beam-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(20, 1fr)",
          gridTemplateRows: "repeat(20, 1fr)",
          gap: "1px",
          flex: 1,
          minHeight: 0,
        }}
      >
        {grid.map((row, y) =>
          row.map((val, x) => (
            <div
              key={`${y}-${x}`}
              style={{
                background: `rgba(16, 185, 129, ${val})`,
                boxShadow: val > 0.6 ? `0 0 3px rgba(16,185,129,${val * 0.8})` : undefined,
                borderRadius: "1px",
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
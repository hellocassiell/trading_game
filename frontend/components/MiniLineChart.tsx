type MiniLineChartProps = {
  className?: string;
  wide?: boolean;
};

export default function MiniLineChart({
  className = "",
  wide = false,
}: MiniLineChartProps) {
  const width = wide ? 144 : 108;
  const height = wide ? 56 : 46;

  return (
    <div className={className}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <path
          d={`M4 ${height - 12} C 26 ${height - 16}, 36 ${height - 24}, 50 ${
            height - 22
          } C 72 ${height - 20}, 86 ${height - 32}, ${width - 24} ${
            height - 24
          } C ${width - 10} ${height - 20}, ${width - 6} ${height - 28}, ${
            width - 4
          } 10`}
          stroke="#f0a04a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {[
          [8, height - 12],
          [33, height - 21],
          [57, height - 18],
          [88, height - 28],
          [width - 4, 10],
        ].map(([x, y], index) => (
          <g key={`${x}-${y}-${index}`}>
            <circle cx={x} cy={y} r="4.5" fill="white" />
            <circle cx={x} cy={y} r="3" fill="#f38b1b" />
          </g>
        ))}
        <path
          d={`M1 ${height - 2} H ${width - 1}`}
          stroke="#f2dfca"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

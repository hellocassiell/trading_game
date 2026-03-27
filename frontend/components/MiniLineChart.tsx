type MiniLineChartProps = {
  className?: string;
  wide?: boolean;
};

export default function MiniLineChart({
  className = "",
  wide = false,
}: MiniLineChartProps) {
  return (
    <div className={`relative ${wide ? "h-11 w-32" : "h-10 w-24"} ${className}`}>
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[#e8eef8]" />
      <div className="absolute left-0 right-1 top-0 h-[1px] border-t border-dashed border-[#eef3fb]" />
      <div
        className={`absolute bottom-[8px] left-1 h-[2px] ${
          wide ? "w-[98px]" : "w-[72px]"
        } rotate-[10deg] bg-[#96b8ff]`}
      />
      <div className="absolute bottom-[7px] left-[4px] h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
      <div className="absolute bottom-[11px] left-[26px] h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
      <div className="absolute bottom-[18px] left-[54px] h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
      <div
        className={`absolute ${
          wide ? "left-[90px] bottom-[25px]" : "left-[74px] bottom-[22px]"
        } h-1.5 w-1.5 rounded-full bg-[#3b82f6]`}
      />
    </div>
  );
}

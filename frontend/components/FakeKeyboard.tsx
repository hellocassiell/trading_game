const rows = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

export default function FakeKeyboard() {
  return (
    <div className="rounded-b-[4px] bg-[#d7dbe3] px-1.5 pb-2 pt-1.5">
      <div className="space-y-1">
        {rows.map((row, rowIndex) => (
          <div key={row.join("-")} className="flex justify-center gap-1">
            {rowIndex === 2 ? (
              <>
                <div className="h-6 w-8 rounded-[4px] bg-[#c3c8d1]" />
                {row.map((key) => (
                  <div
                    key={key}
                    className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-white text-[8px] font-medium text-[#4b5563] shadow-[0_1px_0_rgba(0,0,0,0.08)]"
                  >
                    {key}
                  </div>
                ))}
                <div className="h-6 w-8 rounded-[4px] bg-[#c3c8d1]" />
              </>
            ) : (
              row.map((key) => (
                <div
                  key={key}
                  className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-white text-[8px] font-medium text-[#4b5563] shadow-[0_1px_0_rgba(0,0,0,0.08)]"
                >
                  {key}
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      <div className="mt-1 flex items-center gap-1">
        <div className="h-6 w-8 rounded-[4px] bg-[#c3c8d1]" />
        <div className="flex-1 rounded-[4px] bg-white py-1 text-center text-[8px] text-[#4b5563] shadow-[0_1px_0_rgba(0,0,0,0.08)]">
          space
        </div>
        <div className="h-6 w-8 rounded-[4px] bg-[#2b5ce5]" />
      </div>
    </div>
  );
}

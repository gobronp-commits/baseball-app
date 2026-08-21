export type Column<T> = {
  header: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
};

export default function Leaderboard<T>({
  title,
  rows,
  columns,
  rowKey,
  emptyMessage = "Nothing yet.",
}: {
  title: string;
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-black/50 dark:text-white/50 mb-3">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="text-black/50 dark:text-white/50 border-b border-black/10 dark:border-white/10">
                {columns.map((c, i) => (
                  <th
                    key={i}
                    className={
                      "font-normal py-1 " +
                      (c.align === "right" ? "text-right" : "text-left pr-3")
                    }
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-black/5 dark:border-white/5">
                  {columns.map((c, i) => (
                    <td
                      key={i}
                      className={
                        "py-1.5 " + (c.align === "right" ? "text-right tabular-nums" : "pr-3")
                      }
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

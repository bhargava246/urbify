export type DataTableColumn<T> = {
  key: keyof T;
  header: string;
};

export function DataTable<T extends Record<string, unknown>>({
  rows,
  columns
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
}) {
  return (
    <table>
      <thead>
        <tr>{columns.map((column) => <th key={String(column.key)}>{column.header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => <td key={String(column.key)}>{String(row[column.key] ?? "")}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

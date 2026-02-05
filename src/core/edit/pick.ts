export function pickRowsCols(rows: string[][], rowIdx0: number[], colIdx0: number[]): string[][] {
  const pickedRows = rowIdx0.map(r => rows[r] ?? []);
  return pickedRows.map(r => colIdx0.map(c => (r[c] ?? "")));
}

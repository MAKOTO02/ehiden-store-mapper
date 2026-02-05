export type TrimRange = {
  // 0-based, inclusive
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
};

export function clampRange(range: TrimRange, rowCount: number, colCount: number): TrimRange {
  const rs = clamp(range.rowStart, 0, Math.max(0, rowCount - 1));
  const re = clamp(range.rowEnd,   0, Math.max(0, rowCount - 1));
  const cs = clamp(range.colStart, 0, Math.max(0, colCount - 1));
  const ce = clamp(range.colEnd,   0, Math.max(0, colCount - 1));

  return {
    rowStart: Math.min(rs, re),
    rowEnd: Math.max(rs, re),
    colStart: Math.min(cs, ce),
    colEnd: Math.max(cs, ce),
  };
}

export function trimTable(rows: string[][], range: TrimRange): string[][] {
  return rows
    .slice(range.rowStart, range.rowEnd + 1)
    .map((r) => r.slice(range.colStart, range.colEnd + 1));
}

export function getColCount(rows: string[][]): number {
  return rows.length === 0 ? 0 : Math.max(...rows.map(r => r.length));
}

function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

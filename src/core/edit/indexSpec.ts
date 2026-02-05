export type IndexSpecResult = {
  indices0: number[]; // 0-based, sorted, unique
  warnings: string[];
};

export function parseIndexSpec1Based(spec: string, maxCount: number): IndexSpecResult {
  const s = spec.replace(/\s+/g, "");
  if (s.length === 0) return { indices0: [], warnings: [] };

  const warnings: string[] = [];
  const set = new Set<number>();

  const parts = s.split(",").filter(Boolean);
  for (const p of parts) {
    const m = p.match(/^(\d+)-(\d+)$/);
    if (m) {
      let a = toInt(m[1]);
      let b = toInt(m[2]);
      if (a <= 0 || b <= 0) { warnings.push(`無効: "${p}"`); continue; }
      if (a > b) [a, b] = [b, a];

      for (let k = a; k <= b; k++) addClamped(set, k - 1, maxCount, warnings, p);
      continue;
    }

    const n = p.match(/^\d+$/) ? toInt(p) : NaN;
    if (!Number.isFinite(n) || n <= 0) { warnings.push(`無効: "${p}"`); continue; }
    addClamped(set, n - 1, maxCount, warnings, p);
  }

  const indices0 = Array.from(set).sort((a, b) => a - b);
  return { indices0, warnings };
}

function addClamped(set: Set<number>, idx0: number, maxCount: number, warnings: string[], token: string) {
  if (maxCount <= 0) return;
  if (idx0 < 0) { warnings.push(`範囲外(小): "${token}" → 1 に丸めました`); idx0 = 0; }
  if (idx0 >= maxCount) { warnings.push(`範囲外(大): "${token}" → ${maxCount} に丸めました`); idx0 = maxCount - 1; }
  set.add(idx0);
}

function toInt(x: string) {
  return Math.trunc(Number(x));
}

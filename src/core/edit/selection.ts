export type Range0 = { start0: number; end0: number };

export type BuildSelectionInput = {
  count: number;                 // 行数 or 列数
  range0?: Range0;               // 未指定なら全体集合扱い
  list0?: number[];              // 未指定/空なら全体集合扱い
};

export type BuildSelectionResult = {
  indices0: number[];            // 0-based, sorted
};

export function buildSelectionAND(input: BuildSelectionInput): BuildSelectionResult {
  const { count } = input;
  if (count <= 0) return { indices0: [] };

  // 全体集合
  let set = allSet(count);

  // 範囲 ∩
  if (input.range0) {
    const r = normalizeRange0(input.range0, count);
    set = intersect(set, rangeSet(r.start0, r.end0));
  }

  // リスト ∩
  if (input.list0 && input.list0.length > 0) {
    const clamped = input.list0
      .filter((x) => Number.isFinite(x))
      .map((x) => clampInt(x, 0, count - 1));
    set = intersect(set, new Set(clamped));
  }

  return { indices0: Array.from(set).sort((a, b) => a - b) };
}

function allSet(count: number) {
  return new Set<number>(Array.from({ length: count }, (_, i) => i));
}

function rangeSet(start0: number, end0: number) {
  const s = new Set<number>();
  for (let i = start0; i <= end0; i++) s.add(i);
  return s;
}

function intersect(a: Set<number>, b: Set<number>) {
  const out = new Set<number>();
  for (const x of a) if (b.has(x)) out.add(x);
  return out;
}

function normalizeRange0(range0: Range0, count: number): Range0 {
  const s = clampInt(range0.start0, 0, count - 1);
  const e = clampInt(range0.end0,   0, count - 1);
  return { start0: Math.min(s, e), end0: Math.max(s, e) };
}

function clampInt(n: number, min: number, max: number) {
  const x = Math.trunc(n);
  return Math.min(max, Math.max(min, x));
}

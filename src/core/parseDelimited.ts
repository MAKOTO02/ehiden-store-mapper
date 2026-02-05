import type { Delimiter, ParseResult } from "./types";

function detectDelimiter(line: string): Delimiter {
  const counts: Array<[Delimiter, number]> = [
    [",", (line.match(/,/g) ?? []).length],
    ["\t", (line.match(/\t/g) ?? []).length],
    [";", (line.match(/;/g) ?? []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

export function parseDelimitedSimple(text: string): ParseResult {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalized.split("\n");
  const lines = rawLines.filter((l) => l.trim() !== "");
  if (lines.length === 0) return { rows: [], delimiter: "," };

  const delim = detectDelimiter(lines[0]);
  const rows = lines.map((l) => l.split(delim).map((x) => x.trim()));
  return { rows, delimiter: delim };
}

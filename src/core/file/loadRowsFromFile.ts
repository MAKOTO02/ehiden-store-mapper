import { parseDelimitedSimple } from "../parseDelimited";
import { readTextFile } from "./fileRead";
import { readExcelRows } from "./fileReadExcel"; // 上の関数を別ファイルへ

export async function loadRowsFromFile(file: File): Promise<{ rows: string[][]; kind: "csv" | "xlsx" }> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".xlsx")) {
    const { rows } = await readExcelRows(file);
    return { rows, kind: "xlsx" };
  }

  // csv/tsv は今の実装を利用
  const text = await readTextFile(file);
  const parsed = parseDelimitedSimple(text);
  return { rows: parsed.rows, kind: "csv" };
}

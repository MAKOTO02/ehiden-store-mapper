import * as XLSX from "xlsx";

export async function readExcelRows(file: File): Promise<{ rows: string[][]; sheetNames: string[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const sheetNames = wb.SheetNames;
  const sheet = wb.Sheets[sheetNames[0]]; // まずは1枚目

  // 2D配列で取り出す（空セルも保持しやすい）
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,         // 1行目をヘッダとして扱わず、純粋に2D配列化
    blankrows: false,  // 空行は落とす（必要ならtrue）
    defval: "",        // undefinedを""にして列ズレを減らす
  });

  return { rows, sheetNames };
}

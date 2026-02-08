export async function readTextFile(file: File): Promise<string> {
  // Shift_JIS 対応は後でここに集約する（超重要）
  return await file.text();
}

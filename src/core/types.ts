export type Delimiter = "," | "\t" | ";";

export type ParseResult = {
  rows: string[][];
  delimiter: Delimiter;
};

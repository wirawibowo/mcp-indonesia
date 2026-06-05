/**
 * Helper tipe & pembungkus respons MCP.
 *
 * Tool MCP harus mengembalikan struktur `{ content: [...] }`. Helper di sini
 * menjaga konsistensi format antar modul dan menyederhanakan pembuatan respons.
 */

export interface TextContent {
  type: "text";
  text: string;
}

export interface ToolResult {
  // Index signature wajib agar kompatibel dengan tipe CallToolResult SDK.
  [key: string]: unknown;
  content: TextContent[];
  isError?: boolean;
}

/** Sumber data untuk atribusi (BMKG mewajibkan; lainnya dianjurkan). */
export interface Attribution {
  source: string;
  url?: string;
}

/** Bungkus teks biasa menjadi respons tool MCP. */
export function textResult(text: string): ToolResult {
  return { content: [{ type: "text", text }] };
}

/**
 * Bungkus objek menjadi respons tool MCP (JSON ter-format).
 * `attribution` ditambahkan ke payload agar sumber data selalu terlihat.
 */
export function jsonResult(data: unknown, attribution?: Attribution): ToolResult {
  const payload = attribution ? { data, attribution } : { data };
  return textResult(JSON.stringify(payload, null, 2));
}

/** Bungkus pesan error menjadi respons tool MCP yang menandai kegagalan. */
export function errorResult(message: string): ToolResult {
  return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
}

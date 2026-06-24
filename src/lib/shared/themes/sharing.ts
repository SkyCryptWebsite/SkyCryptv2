import * as devalue from "devalue";
import { DEFAULT_THEME } from "./defaults";
import { mergeThemeWithDefaults } from "./engine";
import { partialThemeV4Schema, themeV4Schema } from "./schema";
import type { PartialThemeV4, ThemeV4 } from "./schema";

function stripDefaults(theme: ThemeV4, defaults: ThemeV4): PartialThemeV4 {
  const partial: PartialThemeV4 = {
    schema: 4
  };

  const metadataDiffs: Partial<ThemeV4["metadata"]> = {};
  if (theme.metadata.id !== defaults.metadata.id) metadataDiffs.id = theme.metadata.id;
  if (theme.metadata.name !== defaults.metadata.name) metadataDiffs.name = theme.metadata.name;
  if (theme.metadata.author !== defaults.metadata.author) metadataDiffs.author = theme.metadata.author;
  if (theme.metadata.version !== defaults.metadata.version) metadataDiffs.version = theme.metadata.version;
  if (Object.keys(metadataDiffs).length > 0) partial.metadata = metadataDiffs;

  if (theme.mode !== defaults.mode) partial.mode = theme.mode;

  const cssVarDiffs: ThemeV4["cssVars"] = {};
  for (const key in theme.cssVars) {
    const k = key as keyof ThemeV4["cssVars"];
    if (theme.cssVars[k] !== defaults.cssVars[k]) {
      cssVarDiffs[k] = theme.cssVars[k];
    }
  }
  if (Object.keys(cssVarDiffs).length > 0) partial.cssVars = cssVarDiffs;

  if (devalue.stringify(theme.extras) !== devalue.stringify(defaults.extras)) {
    partial.extras = theme.extras;
  }

  return partial;
}

function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(str: string): Uint8Array | null {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const binary = atob(base64);
    return new Uint8Array(binary.split("").map((c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

export async function encodeTheme(theme: ThemeV4): Promise<string> {
  const result = themeV4Schema.safeParse(theme);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message ?? "Cannot encode invalid theme");
  }

  const partial = stripDefaults(result.data, DEFAULT_THEME);
  const json = devalue.stringify(partial);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(json));
      controller.close();
    }
  });

  const compressedStream = stream.pipeThrough(new CompressionStream("deflate"));
  const compressedData = await new Response(compressedStream).arrayBuffer();
  return base64urlEncode(new Uint8Array(compressedData));
}

export async function decodeTheme(hash: string): Promise<ThemeV4 | null> {
  try {
    const compressedData = base64urlDecode(hash);
    if (!compressedData) return null;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(compressedData);
        controller.close();
      }
    });

    const decompressedStream = stream.pipeThrough(new DecompressionStream("deflate"));
    const decompressedData = await new Response(decompressedStream).arrayBuffer();
    const json = new TextDecoder().decode(decompressedData);
    const parsed = devalue.parse(json);
    const result = partialThemeV4Schema.safeParse(parsed);
    if (!result.success || result.data.schema !== 4) return null;

    return mergeThemeWithDefaults(result.data);
  } catch {
    return null;
  }
}

export async function getThemeShareURL(theme: ThemeV4): Promise<string> {
  const encoded = await encodeTheme(theme);
  return `${window.location.origin}?theme=${encoded}`;
}

export async function parseThemeFromURL(url: string): Promise<ThemeV4 | null> {
  const match = url.match(/\?theme=([^&]+)/);
  if (!match) return null;

  return await decodeTheme(match[1]);
}

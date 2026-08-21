import * as devalue from "devalue";
import { DEFAULT_THEME } from "./defaults";
import { mergeThemeWithDefaults } from "./engine";
import { migratePartialThemeV4ToV5, partialThemeV4Schema, partialThemeV5Schema, themeV5Schema } from "./schema";
import type { PartialThemeV5, ThemeModeName, ThemeV5 } from "./schema";

function stripDefaults(theme: ThemeV5, defaults: ThemeV5): PartialThemeV5 {
  const partial: PartialThemeV5 = {
    schema: 5
  };

  const metadataDiffs: Partial<ThemeV5["metadata"]> = {};
  if (theme.metadata.id !== defaults.metadata.id) metadataDiffs.id = theme.metadata.id;
  if (theme.metadata.name !== defaults.metadata.name) metadataDiffs.name = theme.metadata.name;
  if (theme.metadata.author !== defaults.metadata.author) metadataDiffs.author = theme.metadata.author;
  if (theme.metadata.version !== defaults.metadata.version) metadataDiffs.version = theme.metadata.version;
  if (Object.keys(metadataDiffs).length > 0) partial.metadata = metadataDiffs;

  const modeDiffs: PartialThemeV5["modes"] = {};
  for (const modeName of ["dark", "light"] as const satisfies ThemeModeName[]) {
    const mode = theme.modes[modeName];
    const defaultMode = defaults.modes[modeName];
    const cssVarDiffs: ThemeV5["modes"][ThemeModeName]["cssVars"] = {};

    for (const key in mode.cssVars) {
      const k = key as keyof ThemeV5["modes"][ThemeModeName]["cssVars"];
      if (mode.cssVars[k] !== defaultMode.cssVars[k]) {
        cssVarDiffs[k] = mode.cssVars[k];
      }
    }

    const modePartial: NonNullable<PartialThemeV5["modes"]>[ThemeModeName] = {};
    if (Object.keys(cssVarDiffs).length > 0) modePartial.cssVars = cssVarDiffs;

    if (devalue.stringify(mode.extras) !== devalue.stringify(defaultMode.extras)) {
      modePartial.extras = mode.extras;
    }

    if (Object.keys(modePartial).length > 0) {
      modeDiffs[modeName] = modePartial;
    }
  }

  if (modeDiffs && Object.keys(modeDiffs).length > 0) {
    partial.modes = modeDiffs;
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

function parseSharedThemePayload(json: string): unknown {
  try {
    return devalue.parse(json);
  } catch {
    return JSON.parse(json);
  }
}

export async function encodeTheme(theme: ThemeV5): Promise<string> {
  const result = themeV5Schema.safeParse(theme);
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

export async function decodeTheme(hash: string): Promise<ThemeV5 | null> {
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
    const parsed = parseSharedThemePayload(json);
    const v5Result = partialThemeV5Schema.safeParse(parsed);
    if (v5Result.success && (v5Result.data.schema === 5 || v5Result.data.schema === undefined)) {
      return mergeThemeWithDefaults(v5Result.data);
    }

    const v4Result = partialThemeV4Schema.safeParse(parsed);
    if (v4Result.success && (v4Result.data.schema === 4 || v4Result.data.schema === undefined)) {
      return mergeThemeWithDefaults(migratePartialThemeV4ToV5(v4Result.data));
    }

    return null;
  } catch {
    return null;
  }
}

export async function getThemeShareURL(theme: ThemeV5): Promise<string> {
  const encoded = await encodeTheme(theme);
  return `${window.location.origin}?theme=${encoded}`;
}

export async function parseThemeFromURL(url: string): Promise<ThemeV5 | null> {
  const match = url.match(/\?theme=([^&]+)/);
  if (!match) return null;

  return await decodeTheme(match[1]);
}

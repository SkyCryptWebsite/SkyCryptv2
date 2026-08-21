import { describe, expect, it } from "vitest";
import { DEFAULT_THEME } from "./defaults";
import { decodeTheme, encodeTheme, parseThemeFromURL } from "./sharing";

async function encodePayload(payload: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(json);
      controller.close();
    }
  });
  const compressed = await new Response(stream.pipeThrough(new CompressionStream("deflate"))).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(compressed)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

describe("Theme Sharing", () => {
  it("roundtrips a V5 theme with mode branches", async () => {
    const testTheme = {
      ...DEFAULT_THEME,
      metadata: {
        ...DEFAULT_THEME.metadata,
        id: "shared",
        name: "Shared Theme"
      },
      modes: {
        dark: {
          cssVars: {
            primary: "oklch(0.5 0.1 100)",
            accent2: "oklch(0.7 0.1 80)"
          }
        },
        light: {
          cssVars: {
            primary: "oklch(0.8 0.1 100)"
          }
        }
      }
    };

    const encoded = await encodeTheme(testTheme);

    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
    expect(encoded).not.toContain("=");

    const decoded = await decodeTheme(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.schema).toBe(5);
    expect(decoded!.modes.dark.cssVars.primary).toBe("oklch(0.5 0.1 100)");
    expect(decoded!.modes.dark.cssVars.accent2).toBe("oklch(0.7 0.1 80)");
    expect(decoded!.modes.light.cssVars.primary).toBe("oklch(0.8 0.1 100)");
    expect(decoded!.modes.dark.cssVars.background).toBeUndefined();
    expect(decoded!.metadata.name).toBe("Shared Theme");
  });

  it("produces compact strings for minimal changes", async () => {
    const encoded = await encodeTheme({
      ...DEFAULT_THEME,
      modes: {
        ...DEFAULT_THEME.modes,
        dark: {
          cssVars: {
            primary: "oklch(0.5 0.1 100)"
          }
        }
      }
    });

    expect(encoded.length).toBeLessThan(320);
  });

  it("returns null for invalid payloads", async () => {
    await expect(decodeTheme("invalid!!!")).resolves.toBeNull();
    await expect(decodeTheme("")).resolves.toBeNull();
    await expect(decodeTheme("YWJjZGVmZ2g")).resolves.toBeNull();
  });

  it("rejects imported themes with invalid ids", async () => {
    const encoded = await encodePayload({
      schema: 5,
      metadata: {
        id: "bad theme"
      }
    });

    await expect(decodeTheme(encoded)).resolves.toBeNull();
  });

  it("rejects V3 payloads", async () => {
    const legacyTheme = {
      schema: 3,
      colors: {
        icon: "oklch(0.5 0.1 100)"
      }
    };
    const base64 = await encodePayload(legacyTheme);

    await expect(decodeTheme(base64)).resolves.toBeNull();
  });

  it("migrates V4 payloads to V5", async () => {
    const encoded = await encodePayload({
      schema: 4,
      mode: "dark",
      cssVars: {
        primary: "oklch(0.5 0.1 100)"
      },
      metadata: {
        ...DEFAULT_THEME.metadata,
        id: "legacy-shared",
        name: "Legacy Shared"
      }
    });

    const decoded = await decodeTheme(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.schema).toBe(5);
    expect(decoded?.modes.dark.cssVars.primary).toBe("oklch(0.5 0.1 100)");
    expect(decoded?.modes.light.cssVars).toEqual({});
  });

  it("roundtrips custom extras per mode", async () => {
    const encoded = await encodeTheme({
      ...DEFAULT_THEME,
      metadata: {
        ...DEFAULT_THEME.metadata,
        id: "shared-extras"
      },
      modes: {
        dark: {
          cssVars: {},
          extras: {
            minecraft: {
              palette: "true-colors",
              overrides: {
                a: "oklch(0.5 0.1 100)"
              }
            },
            pageBackground: {
              url: "https://example.com/bg.png"
            },
            enchantedGlint: "https://example.com/glint.png"
          }
        },
        light: {
          cssVars: {}
        }
      }
    });
    const decoded = await decodeTheme(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.modes.dark.extras?.minecraft?.palette).toBe("true-colors");
    expect(decoded?.modes.dark.extras?.minecraft?.overrides?.a).toBe("oklch(0.5 0.1 100)");
    expect(decoded?.modes.dark.extras?.pageBackground?.url).toBe("https://example.com/bg.png");
    expect(decoded?.modes.dark.extras?.enchantedGlint).toBe("https://example.com/glint.png");
    expect(decoded?.modes.light.extras).toBeUndefined();
  });

  it("extracts and decodes a theme from a URL", async () => {
    const encoded = await encodeTheme({
      ...DEFAULT_THEME,
      modes: {
        ...DEFAULT_THEME.modes,
        dark: {
          cssVars: {
            primary: "oklch(0.5 0.1 100)"
          }
        }
      }
    });
    const parsed = await parseThemeFromURL(`https://example.com/page?theme=${encoded}`);

    expect(parsed).not.toBeNull();
    expect(parsed!.modes.dark.cssVars.primary).toBe("oklch(0.5 0.1 100)");
  });

  it("returns null when the URL has no theme", async () => {
    await expect(parseThemeFromURL("https://example.com/page")).resolves.toBeNull();
  });
});

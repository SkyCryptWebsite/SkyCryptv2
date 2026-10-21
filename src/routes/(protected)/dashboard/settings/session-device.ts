const BROWSERS: [RegExp, string][] = [
  [/Edg(?:e|A|iOS)?\//, "Edge"],
  [/(?:OPR|Opera)\//, "Opera"],
  [/(?:Firefox|FxiOS)\//, "Firefox"],
  [/(?:Chrome|CriOS)\//, "Chrome"],
  [/Safari\//, "Safari"]
];

const PLATFORMS: [RegExp, string][] = [
  [/iPad/, "iPad"],
  [/iPhone/, "iPhone"],
  [/Android/, "Android"],
  [/Windows/, "Windows"],
  [/Macintosh|Mac OS X/, "macOS"],
  [/Linux/, "Linux"]
];

export function sessionDevice(userAgent: string | null | undefined) {
  const agent = userAgent ?? "";
  const browser = BROWSERS.find(([pattern]) => pattern.test(agent))?.[1] ?? "Unknown browser";
  const platform = PLATFORMS.find(([pattern]) => pattern.test(agent))?.[1] ?? null;
  return { name: platform ? `${browser} on ${platform}` : browser, mobile: /Android|iPhone|iPad/.test(agent) };
}

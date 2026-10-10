export function sessionDevice(userAgent: string | null | undefined) {
  const agent = userAgent ?? "";
  const browser = /Edg(?:e|A|iOS)?\//.test(agent)
    ? "Edge"
    : /(?:OPR|Opera)\//.test(agent)
      ? "Opera"
      : /(?:Firefox|FxiOS)\//.test(agent)
        ? "Firefox"
        : /(?:Chrome|CriOS)\//.test(agent)
          ? "Chrome"
          : /Safari\//.test(agent)
            ? "Safari"
            : "Unknown browser";
  const platform = /iPad/.test(agent)
    ? "iPad"
    : /iPhone/.test(agent)
      ? "iPhone"
      : /Android/.test(agent)
        ? "Android"
        : /Windows/.test(agent)
          ? "Windows"
          : /Macintosh|Mac OS X/.test(agent)
            ? "macOS"
            : /Linux/.test(agent)
              ? "Linux"
              : null;
  return { name: platform ? `${browser} on ${platform}` : browser, mobile: /Android|iPhone|iPad/.test(agent) };
}

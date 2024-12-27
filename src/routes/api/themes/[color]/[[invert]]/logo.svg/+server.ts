import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const color = decodeURIComponent(params.color ?? "0, 0%, 0%");
  const invert = params.invert;

  console.log("--- HERE ---");
  console.log(color, invert);

  const background = invert ? "0 0% 100%" : color;
  const foreground = invert ? color : "0 0% 100%";

  const svg = ` <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
    <title>SkyCrypt Logo</title>
    <rect rx="16" height="120" width="120" y="0" x="0" fill="hsl(${background})" />
    <g fill="hsl(${foreground})">
      <rect rx="4" height="28" width="19" y="69" x="22" />
      <rect rx="4" height="75" width="19" y="22" x="50" />
      <rect rx="4" height="47" width="19" y="50" x="79" />
    </g>
  </svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};

type CanvasFactory = () => Pick<HTMLCanvasElement, "getContext">;

const strictWebGLContextOptions = { failIfMajorPerformanceCaveat: true } as const;

/**
 * Checks whether the browser can provide a WebGL context without a major performance caveat. This is a capability proxy
 * for graphics acceleration; browsers do not expose a definitive hardware-acceleration setting.
 */
export function isGraphicsAccelerationAvailable(
  createCanvas: CanvasFactory = () => document.createElement("canvas")
): boolean {
  try {
    if (createCanvas().getContext("webgl2", strictWebGLContextOptions)) return true;
    return !!createCanvas().getContext("webgl", strictWebGLContextOptions);
  } catch {
    return false;
  }
}

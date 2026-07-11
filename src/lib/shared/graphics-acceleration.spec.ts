import { describe, expect, it, vi } from "vitest";
import { isGraphicsAccelerationAvailable } from "./graphics-acceleration";

type ContextFactory = (contextId: string, options?: WebGLContextAttributes) => unknown;

function canvas(getContext: ContextFactory): Pick<HTMLCanvasElement, "getContext"> {
  return { getContext: getContext as HTMLCanvasElement["getContext"] };
}

describe("isGraphicsAccelerationAvailable", () => {
  it("accepts a strict WebGL2 context", () => {
    const getContext = vi.fn(() => ({}));
    const createCanvas = vi.fn(() => canvas(getContext));

    expect(isGraphicsAccelerationAvailable(createCanvas)).toBe(true);
    expect(createCanvas).toHaveBeenCalledTimes(1);
    expect(getContext).toHaveBeenCalledWith("webgl2", { failIfMajorPerformanceCaveat: true });
  });

  it("falls back to a strict WebGL context", () => {
    const webgl2 = vi.fn(() => null);
    const webgl = vi.fn(() => ({}));
    const createCanvas = vi.fn().mockReturnValueOnce(canvas(webgl2)).mockReturnValueOnce(canvas(webgl));

    expect(isGraphicsAccelerationAvailable(createCanvas)).toBe(true);
    expect(webgl2).toHaveBeenCalledWith("webgl2", { failIfMajorPerformanceCaveat: true });
    expect(webgl).toHaveBeenCalledWith("webgl", { failIfMajorPerformanceCaveat: true });
  });

  it("returns false when neither strict context is available", () => {
    const getContext = vi.fn(() => null);
    const createCanvas = vi.fn(() => canvas(getContext));

    expect(isGraphicsAccelerationAvailable(createCanvas)).toBe(false);
    expect(createCanvas).toHaveBeenCalledTimes(2);
  });

  it("returns false when context creation throws", () => {
    const createCanvas = vi.fn(() => {
      throw new Error("WebGL unavailable");
    });

    expect(isGraphicsAccelerationAvailable(createCanvas)).toBe(false);
  });
});

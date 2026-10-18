import { expect, it } from "vitest";
import { sessionDevice } from "./session-device";

it("distinguishes Chromium browsers and handles mobile and missing metadata", () => {
  expect(sessionDevice("Mozilla/5.0 (Windows NT 10.0) Chrome/130 Safari/537.36 Edg/130")).toEqual({
    name: "Edge on Windows",
    mobile: false
  });
  expect(sessionDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) CriOS/130 Mobile Safari/604.1")).toEqual({
    name: "Chrome on iPhone",
    mobile: true
  });
  expect(sessionDevice("Mozilla/5.0 (Macintosh) Version/18.0 Safari/605.1").name).toBe("Safari on macOS");
  expect(sessionDevice(null)).toEqual({ name: "Unknown browser", mobile: false });
});

import { describe, it } from "vitest";
import { cn } from "./utils";

describe.concurrent("cn() - Tailwind merge + clsx utility", () => {
  it("handles single class", ({ expect }) => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("handles multiple classes", ({ expect }) => {
    expect(cn("text-red-500", "bg-blue-300", "p-4")).toBe("text-red-500 bg-blue-300 p-4");
  });

  it("handles conditional classes via clsx syntax", ({ expect }) => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base-class", { "active-class": isActive, "disabled-class": isDisabled })).toBe(
      "base-class active-class"
    );
  });

  it("merges conflicting tailwind classes (padding)", ({ expect }) => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("merges conflicting tailwind classes (margin)", ({ expect }) => {
    expect(cn("m-2", "m-4")).toBe("m-4");
  });

  it("merges conflicting tailwind classes (text color)", ({ expect }) => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("merges conflicting tailwind classes (background)", ({ expect }) => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("preserves non-conflicting classes", ({ expect }) => {
    expect(cn("p-4", "m-2", "text-red-500")).toBe("p-4 m-2 text-red-500");
  });

  it("merges conflicting classes in complex scenario", ({ expect }) => {
    expect(cn("p-4 text-red-500", "bg-blue-300 p-2")).toBe("text-red-500 bg-blue-300 p-2");
  });

  it("handles empty input", ({ expect }) => {
    expect(cn()).toBe("");
  });

  it("handles empty string", ({ expect }) => {
    expect(cn("")).toBe("");
  });

  it("filters falsy values", ({ expect }) => {
    expect(cn("text-red-500", false, null, undefined, 0, "bg-blue-300")).toBe("text-red-500 bg-blue-300");
  });

  it("handles array of classes", ({ expect }) => {
    expect(cn(["text-red-500", "bg-blue-300"])).toBe("text-red-500 bg-blue-300");
  });

  it("handles nested arrays and objects", ({ expect }) => {
    expect(cn(["text-red-500", { "bg-blue-300": true, "p-4": false }], "m-2")).toBe("text-red-500 bg-blue-300 m-2");
  });

  it("handles conflicting directional padding", ({ expect }) => {
    expect(cn("px-4", "px-2")).toBe("px-2");
    expect(cn("py-4", "py-2")).toBe("py-2");
    expect(cn("pt-4", "pt-2")).toBe("pt-2");
    expect(cn("pr-4", "pr-2")).toBe("pr-2");
    expect(cn("pb-4", "pb-2")).toBe("pb-2");
    expect(cn("pl-4", "pl-2")).toBe("pl-2");
  });

  it("handles conflicting directional margin", ({ expect }) => {
    expect(cn("mx-4", "mx-2")).toBe("mx-2");
    expect(cn("my-4", "my-2")).toBe("my-2");
  });

  it("preserves non-tailwind classes", ({ expect }) => {
    expect(cn("custom-class", "another-custom")).toBe("custom-class another-custom");
  });

  it("handles mixed tailwind and custom classes with conflicts", ({ expect }) => {
    expect(cn("custom-class p-4", "another-custom p-2")).toBe("custom-class another-custom p-2");
  });

  it("handles undefined and null in object syntax", ({ expect }) => {
    expect(cn({ "text-red-500": true, "bg-blue-300": false, "p-4": null, "m-2": undefined })).toBe("text-red-500");
  });

  it("handles whitespace in class strings", ({ expect }) => {
    expect(cn("text-red-500", "bg-blue-300")).toBe("text-red-500 bg-blue-300");
  });
});

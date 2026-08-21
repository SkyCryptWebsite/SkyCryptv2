import { describe, expect, it } from "vitest";
import { buildReleaseBody, extractReleaseSection, selectPreviousRelease } from "./release-notes.js";

const changelog = `# Changelog

## 3.9.0-beta.4

### Patch Changes

- Preserve [a link](https://example.com) and contributor attribution.

## 3.9.0

### Minor Changes

- Publish the stable release.

## 3.8.0

### Patch Changes

- Earlier release.
`;

const releases = [
  { tagName: "v3.9.0-beta.4", isDraft: false, isPrerelease: true, publishedAt: "2026-07-10T20:28:29Z" },
  { tagName: "v3.9.0-beta.3", isDraft: false, isPrerelease: true, publishedAt: "2026-07-10T16:36:06Z" },
  { tagName: "v3.9.0", isDraft: false, isPrerelease: false, publishedAt: "2026-07-09T16:36:06Z" },
  { tagName: "v3.8.1-beta.0", isDraft: true, isPrerelease: true, publishedAt: "2026-07-11T16:36:06Z" },
  { tagName: "v3.8.0", isDraft: false, isPrerelease: false, publishedAt: "2026-06-15T23:15:53Z" }
];

describe("extractReleaseSection", () => {
  it("extracts an exact version section without its heading", () => {
    expect(extractReleaseSection(changelog, "3.9.0-beta.4")).toBe(
      "### Patch Changes\n\n- Preserve [a link](https://example.com) and contributor attribution."
    );
    expect(extractReleaseSection(changelog, "3.9.0")).toBe("### Minor Changes\n\n- Publish the stable release.");
    expect(extractReleaseSection(changelog, "3.8.0")).toBe("### Patch Changes\n\n- Earlier release.");
  });

  it("rejects missing and empty sections", () => {
    expect(() => extractReleaseSection(changelog, "3.9.0-beta.5")).toThrow("Could not find a CHANGELOG.md section");
    expect(() => extractReleaseSection("## 3.9.0\n\n## 3.8.0\n", "3.9.0")).toThrow("is empty");
  });
});

describe("selectPreviousRelease", () => {
  it("uses the latest published release for a beta", () => {
    expect(selectPreviousRelease(releases, { prerelease: true, currentTag: "v3.9.0-beta.5" })?.tagName).toBe(
      "v3.9.0-beta.4"
    );
  });

  it("uses the prior stable release for the first beta in a release line", () => {
    const stableReleases = releases.filter((release) => !release.isPrerelease);
    expect(selectPreviousRelease(stableReleases, { prerelease: true, currentTag: "v4.0.0-beta.0" })?.tagName).toBe(
      "v3.9.0"
    );
  });

  it("ignores newer prereleases and drafts for a stable release", () => {
    expect(selectPreviousRelease(releases, { prerelease: false, currentTag: "v3.9.1" })?.tagName).toBe("v3.9.0");
  });

  it("ignores the current tag", () => {
    expect(selectPreviousRelease(releases, { prerelease: true, currentTag: "v3.9.0-beta.4" })?.tagName).toBe(
      "v3.9.0-beta.3"
    );
  });
});

describe("buildReleaseBody", () => {
  it("appends an exact comparison link", () => {
    expect(
      buildReleaseBody({
        changelogSection: "### Patch Changes\n\n- Curated change.",
        currentTag: "v3.9.0-beta.5",
        previousRelease: { tagName: "v3.9.0-beta.4" },
        repository: "SkyCryptWebsite/SkyCrypt-Frontend",
        serverUrl: "https://github.com/"
      })
    ).toBe(
      "### Patch Changes\n\n- Curated change.\n\n**Full Changelog**: https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/compare/v3.9.0-beta.4...v3.9.0-beta.5"
    );
  });

  it("omits the comparison footer without a previous release", () => {
    expect(buildReleaseBody({ changelogSection: "### Patch Changes\n\n- First release.", currentTag: "v1.0.0" })).toBe(
      "### Patch Changes\n\n- First release."
    );
  });
});

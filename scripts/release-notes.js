const DEFAULT_GITHUB_SERVER_URL = "https://github.com";
const DEFAULT_REPOSITORY = "SkyCryptWebsite/SkyCrypt-Frontend";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractReleaseSection(changelog, version) {
  const heading = new RegExp(`^## ${escapeRegExp(version)}\\s*$`, "m");
  const match = heading.exec(changelog);

  if (!match) {
    throw new Error(`Could not find a CHANGELOG.md section for version ${version}`);
  }

  const afterHeading = changelog.slice(match.index + match[0].length);
  const nextHeading = afterHeading.search(/^##\s+/m);
  const section = afterHeading.slice(0, nextHeading === -1 ? undefined : nextHeading).trim();

  if (!section) {
    throw new Error(`CHANGELOG.md section for version ${version} is empty`);
  }

  return section;
}

export function selectPreviousRelease(releases, { prerelease, currentTag }) {
  return releases.filter((release) => !release.isDraft && release.tagName !== currentTag && (prerelease || !release.isPrerelease)).sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime())[0];
}

export function buildReleaseBody({ changelogSection, currentTag, previousRelease, repository = process.env.GITHUB_REPOSITORY || DEFAULT_REPOSITORY, serverUrl = process.env.GITHUB_SERVER_URL || DEFAULT_GITHUB_SERVER_URL }) {
  const body = changelogSection.trim();

  if (!body) {
    throw new Error("Release notes cannot be empty");
  }

  if (!previousRelease) {
    return body;
  }

  const baseUrl = serverUrl.replace(/\/$/, "");
  return `${body}\n\n**Full Changelog**: ${baseUrl}/${repository}/compare/${previousRelease.tagName}...${currentTag}`;
}

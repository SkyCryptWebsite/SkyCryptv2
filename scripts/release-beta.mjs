import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { buildReleaseBody, extractReleaseSection, selectPreviousRelease } from "./release-notes.js";

const changesetDir = path.join(process.cwd(), ".changeset");

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function runOptional(command) {
  try {
    execSync(command, { stdio: "inherit" });
  } catch {
    // Optional command failed.
  }
}

function output(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function outputOptional(command) {
  try {
    return output(command);
  } catch {
    return "";
  }
}

function getReleaseBody(version, tag) {
  const changelog = fs.readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
  const releases = JSON.parse(output("gh release list --limit 100 --json tagName,isDraft,isPrerelease,publishedAt"));
  const previousRelease = selectPreviousRelease(releases, { prerelease: true, currentTag: tag });

  return buildReleaseBody({ changelogSection: extractReleaseSection(changelog, version), currentTag: tag, previousRelease });
}

function createRelease(tag, body) {
  execFileSync("gh", ["release", "create", tag, "--title", tag, "--notes-file", "-", "--prerelease"], { input: body, stdio: ["pipe", "inherit", "inherit"] });
}

run("git fetch origin dev");
run('git config user.name "github-actions[bot]"');
run('git config user.email "github-actions[bot]@users.noreply.github.com"');
run("git checkout -B dev origin/dev");

const preStatePath = path.join(changesetDir, "pre.json");
let isInBetaPreMode = false;

if (fs.existsSync(preStatePath)) {
  try {
    const preState = JSON.parse(fs.readFileSync(preStatePath, "utf8"));
    isInBetaPreMode = preState?.mode === "pre" && preState?.tag === "beta";
  } catch {
    isInBetaPreMode = false;
  }
}

if (!isInBetaPreMode) {
  runOptional("pnpm changeset pre exit");
  run("pnpm changeset pre enter beta");
}

run("pnpm changeset:version");

try {
  execSync("git diff --quiet");
  console.info("No beta version changes detected");
} catch {
  // There are changes to commit.
  run("git add -A");
  run('git commit -m "chore: version packages (beta) [skip ci]"');
  run("git push origin HEAD:dev");
}

const version = output("node -p \"require('./package.json').version\"");

if (!version.includes("beta")) {
  console.info(`Current version (${version}) is not a beta, skipping prerelease`);
  process.exit(0);
}

const tag = `v${version}`;
const releaseBody = getReleaseBody(version, tag);
const remoteTag = output(`git ls-remote --tags origin ${tag}`);

if (remoteTag) {
  console.info(`Tag ${tag} already exists, skipping`);
} else {
  run(`git tag ${tag}`);
  run(`git push origin ${tag}`);
}

const existingRelease = outputOptional(`gh release view ${tag} --json tagName --jq '.tagName'`);

if (existingRelease) {
  console.info(`Release ${tag} already exists, skipping`);
} else {
  createRelease(tag, releaseBody);
}

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
    // Optional command failed (e.g., not in pre mode).
  }
}

function output(command) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function outputOptional(command) {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function getReleaseBody(version, tag) {
  const changelog = fs.readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
  const releases = JSON.parse(output("gh release list --limit 100 --json tagName,isDraft,isPrerelease,publishedAt"));
  const previousRelease = selectPreviousRelease(releases, { prerelease: false, currentTag: tag });

  return buildReleaseBody({
    changelogSection: extractReleaseSection(changelog, version),
    currentTag: tag,
    previousRelease
  });
}

function createRelease(tag, body) {
  execFileSync("gh", ["release", "create", tag, "--title", tag, "--notes-file", "-"], {
    input: body,
    stdio: ["pipe", "inherit", "inherit"]
  });
}

run("git fetch origin prod dev");
run('git config user.name "github-actions[bot]"');
run('git config user.email "github-actions[bot]@users.noreply.github.com"');
run("git checkout -B changeset-release/prod origin/prod");

const preStatePath = path.join(changesetDir, "pre.json");

if (fs.existsSync(preStatePath)) {
  try {
    const preState = JSON.parse(fs.readFileSync(preStatePath, "utf8"));

    if (preState?.mode === "pre") {
      runOptional("pnpm changeset pre exit");
    }
  } catch {
    runOptional("pnpm changeset pre exit");
  }
}

run("pnpm changeset version");

try {
  execSync("git diff --quiet");
  console.info("No stable version changes detected");
} catch {
  // There are changes to commit.
  run("git add -A");
  run('git commit -m "chore: version packages (stable) [skip ci]"');
  run("git push origin HEAD:changeset-release/prod --force");

  let pullNumber = outputOptional(
    "gh pr list --state open --head changeset-release/prod --base prod --json number --jq '.[0].number'"
  );

  if (!pullNumber) {
    run(
      'gh pr create --title "Version Packages (Stable)" --body "Automatically promotes the current beta release line on prod to a stable release." --base prod --head changeset-release/prod'
    );
    pullNumber = output(
      "gh pr list --state open --head changeset-release/prod --base prod --json number --jq '.[0].number'"
    );
  }

  const mergeState = outputOptional(
    `gh pr view ${pullNumber} --json state,mergedAt --jq '.state + "|" + (.mergedAt // "")'`
  );

  if (!mergeState.startsWith("MERGED|")) {
    run(`gh pr merge ${pullNumber} --merge --delete-branch`);
  }

  run("git fetch origin prod");
  run("git checkout -B prod origin/prod");
}

const version = output("node -p \"require('./package.json').version\"");

if (version.includes("beta")) {
  console.info(`Current version (${version}) is still a beta, skipping stable release`);
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

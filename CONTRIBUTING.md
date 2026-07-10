# Contributing to SkyCrypt

Before contributing to SkyCrypt, make sure you install the development environment first. If you have trouble building SkyCrypt or have any development questions, please don't hesitate to contact us on [Discord](https://discord.gg/cNgADv2kEQ)!

## Prerequisite Software

- [Node.js](https://nodejs.org) (at least v24, as of February 2026)
- [pnpm](https://pnpm.io/) (Package manager)

## Backend

SkyCrypt-Frontend, as the name suggests, is the frontend of SkyCrypt. The backend is a separate repository called [SkyCrypt-Backend](https://github.com/SkyCryptWebsite/SkyCrypt-Backend).

> [!IMPORTANT]  
> You will need to set up the backend in order to process and get the data for the frontend to show.

## Getting Started

1. Clone the repository. You can do this on the command line by running

   ```
   git clone https://github.com/SkyCryptWebsite/SkyCrypt-Frontend.git
   ```

   Alternatively, you can use a git GUI like GitHub Desktop or VS Code to clone it.

2. Run `pnpm i` in the project directory to install the necessary dependencies.
3. Duplicate the `.env.example` file and rename it to `.env`. This file contains environment variables that are used by the application.
4. Start the server:

- For development, run `pnpm dev` in the project directory
- For production, run the following commands in order:
  1. `pnpm build` to build the project.
  2. `node build` to start the production server, or `pnpm preview` to use Vite's preview server (not recommended for production deployment).

5. You can now open your browser and go to the address listen in the terminal

- For development (`pnpm dev`), by default, the address is `http://localhost:5173`.
- For preview (`pnpm preview`), by default, the address is `http://localhost:4173`
- For production (`node build`), by default, the address is `http://localhost:3000`.

### VS Code

If you're not sure what code editor to use VS Code ([Visual Studio Code](https://code.visualstudio.com/)) is a great option. We highly recommend using it as we provide a `.vscode` folder with recommended extensions and settings which will help you with development. VS Code-like editors, like Cursor, should also work.

#### Recommended Extensions

VS Code will automatically suggest the extentions we set in the `.vscode/extensions.json` file. Just go to the Extensions tab, click on the `Filter Extensions...` button, and select the `Recommended` filter. Install all the extensions that are listed there.

#### Recommended Settings

VS Code will automatically use our recommended settings in the `.vscode/settings.json` file. Overriding your global settings. If you want to change any of the settings, which we don't recommend, you can do so by changing the settings in the `.vscode/settings.json` file or deleting the file altogether to use your global settings.

Please ensure that you don't accidentally commit the changes you made to the `.vscode/settings.json` file if that's not intended for your contribution. You can do this by adding the file to your `.gitignore` file.

## Pull Requests

When you are ready to submit your changes, please create a pull request (PR) on GitHub. Make sure to check the following:

- **Use Conventional Commits**: Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for your commit messages.
- Your code is well formatted and follows the project's coding style. Run `pnpm lint` to check for linting errors. If there are any `prettier` errors, run `pnpm format` to fix them automatically. If there are any `eslint` or `svelte-check` errors, fix them manually.
- Your code builds successfully. Run `pnpm build` to check.
- Your PR has a clear title and description explaining the changes you made.
- Your PR includes changesets if necessary. If your PR includes changes that should be reflected in the changelog, please include a changeset. You can do this by running `pnpm changeset` and following the prompts.

### Commit Message Format

Your commit messages should follow this format:

```
<type>[optional scope]: <subject>
```

The scope is optional but recommended for better categorization.

**Examples**:

- `feat(stats): add dungeon statistics display`
- `feat: add new feature`
- `fix(ui): correct navbar alignment on mobile`
- `fix: resolve rendering issue`
- `docs: update contributing guidelines`

**Commit Type Reference**: See [conventionalcommits.org](https://www.conventionalcommits.org/en/v1.0.0/#summary) for a quick reference guide.

### Automated Releases

Releases are created automatically based on the branch:

- **dev branch** → Creates prereleases (e.g., `v1.1.0-beta.1`) and deploys to [cupcake.shiiyu.moe](https://cupcake.shiiyu.moe)
- **prod branch** → Creates stable releases (e.g., `v1.1.0`) and deploys to [sky.shiiyu.moe](https://sky.shiiyu.moe)

Release behavior details:

- Changesets are authored in feature PRs and merged into `dev`.
- The beta release workflow commits version/changelog updates directly on `dev` using `github-actions[bot]`.
- Merging `dev` into `prod` promotes the current beta line to a stable release through a `changeset-release/prod` version PR, because the `prod` ruleset requires pull requests.
- Avoid routine manual `prod` → `dev` sync merges unless you are intentionally bringing over a stable-only hotfix.
- All release automation uses the built-in `GITHUB_TOKEN`; the stable workflow explicitly dispatches the production deployment after merging the version PR.
- GitHub release descriptions use the matching `CHANGELOG.md` section plus a Full Changelog comparison link.

The version bump is determined automatically by changesets:

- `patch` patch version (0.0.1 → 0.0.2)
- `minor` minor version (0.0.1 → 0.1.0)
- `major` major version (0.0.1 → 1.0.0)

### Changeset Cleanup Policy

The `.changeset/*.md` files are temporary release inputs:

- If a changeset's entry is already present in a **stable** (non-beta) section of `CHANGELOG.md`, that changeset file should be removed.
- Keep unreleased changesets and currently active prerelease changesets.
- Keep `.changeset/README.md` and `.changeset/pre.json`.

## Issues

If you find a bug or have a feature request, please open an issue on GitHub or on our [Discord server](https://discord.gg/cNgADv2kEQ) (preferred). When opening an issue, please provide as much information as possible, follow the issue template, and include any relevant screenshots or error messages. This will help us understand the problem and address it more quickly.

## License

By contributing to SkyCrypt Frontend, you agree that your contribution is licensed under the repository's current default license, [GNU AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html), unless a more specific license notice applies.

SkyCrypt brand/logo assets listed in [`static/BRAND_ASSETS_LICENSE`](./static/BRAND_ASSETS_LICENSE) remain under the MIT License and are not relicensed under AGPLv3.

Changes to those MIT brand assets must preserve the MIT notice. Non-mechanical changes to those assets require maintainer review before merge.

Do not submit code, assets, textures, fonts, generated files, or other materials unless you have the right to license them under the applicable SkyCrypt Frontend license terms.

Pre-change contributions and versions that were previously released under MIT remain available under their original MIT terms. New contributions from the June 2026 license-change commit onward are accepted under GNU AGPLv3.

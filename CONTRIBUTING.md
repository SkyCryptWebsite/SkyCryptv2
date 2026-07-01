# Contributing to SkyCrypt

Before contributing to SkyCrypt, make sure you install the development environment first. If you have trouble building SkyCrypt or have any development questions, please don't hesitate to contact us on [Discord](https://discord.gg/cNgADv2kEQ)!

## Prerequisite Software

- [Node.js](https://nodejs.org) (at least v22, as of October 2025)
- [pnpm](https://pnpm.io/) (Package manager)
- [Nginx](https://www.nginx.com/) (Optional but an ideal choice for full deployment)

## Backend

SkyCrypt-Frontend, as the name suggests, is the frontend of SkyCrypt. The backend is a separate repository called [SkyCrypt-Backend](https://github.com/SkyCryptWebsite/SkyCrypt-Backend). You will need to set up the backend in order to process and get the data for the frontend to show.

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

5. You can now open your browser and go to the address listed in the terminal

- For development, by default, the address is `http://localhost:5173`.
- For preview, by default, the address is `http://localhost:4173`
- For production, by default, the address is `http://localhost:3000`.

### VS Code

If you're not sure what code editor to use VS Code ([Visual Studio Code](https://code.visualstudio.com/)) is a great option. We highly recommend using it as we provide a `.vscode` folder with recommended extensions and settings which will help you with development. VS Code-like editors, like Cursor, should also work.

#### Recommended Extensions

VS Code will automatically suggest the extensions we set in the `.vscode/extensions.json` file. Just go to the Extensions tab, click on the `Filter Extensions...` button, and select the `Recommended` filter. Install all the extensions that are listed there.

#### Recommended Settings

VS Code will automatically use our recommended settings in the `.vscode/settings.json` file. Overriding your global settings. If you want to change any of the settings, which we don't recommend, you can do so by changing the settings in the `.vscode/settings.json` file or deleting the file altogether to use your global settings.

Please ensure that you don't accidentally commit the changes you made to the `.vscode/settings.json` file if that's not intended for your contribution. You can do this by adding the file to your `.gitignore` file.

## Pull Requests

When you are ready to submit your changes, please create a pull request (PR) on GitHub. Make sure to check the following:

- **Use Conventional Commits**: Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for your commit messages.
- Your code is well formatted and follows the project's coding style. Run `pnpm lint` to check for linting errors. If there are any `prettier` errors, run `pnpm format` to fix them. If there are any `eslint` or `svelte-check` errors, fix them manually.
- Your code builds successfully. Run `pnpm build` to check for build errors.
- Your PR has a clear title and description explaining the changes you made.

### Commit Message Format

We use conventional commits to automatically generate changelogs and manage releases. Your commit messages should follow this format:

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

### Automated Releases

Releases are created automatically based on the branch:

- **dev branch** → Creates prereleases (e.g., `v0.1.0-beta.1`) and deploys to cupcake.shiiyu.moe
- **prod branch** → Creates stable releases (e.g., `v0.1.0`) and deploys to sky.shiiyu.moe

The version bump is determined automatically by your commit types:

- `fix:` commits → patch version (0.0.1 → 0.0.2)
- `feat:` commits → minor version (0.0.1 → 0.1.0)
- Breaking changes (`feat!:` or `BREAKING CHANGE:`) → major version (0.0.1 → 1.0.0)

**Commit Type Reference**: See [.github/CONVENTIONAL_COMMITS.md](.github/CONVENTIONAL_COMMITS.md) for a quick reference guide.

## Issues

If you find a bug or have a feature request, please open an issue on GitHub or on our [Discord server](https://discord.gg/cNgADv2kEQ) (preferred). When opening an issue, please provide as much information as possible, follow the issue template, and include any relevant screenshots or error messages. This will help us understand the problem and address it more quickly.

## License

By contributing to SkyCrypt, you agree that your contributions will be licensed under the [MIT License](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/blob/prod/LICENSE). This means that your contributions will be open source and available for anyone to use, modify, and distribute.

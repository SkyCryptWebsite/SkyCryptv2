<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="static/img/logo_black.png">
    <img alt="SkyCrypt 🍣" height="96px" src="static/img/logo.png">
  </picture>
</p>
<h1 align="center">A Hypixel Skyblock Profile Viewer v2</h1>

This is the new version of [SkyCrypt](https://github.com/SkyCryptWebsite/SkyCrypt), a website that provides information about the game Hypixel SkyBlock. This version is built from the ground up to replace the original SkyCrypt for a more modern and maintainable codebase.

Originally inspired by [LeaPhant's skyblock-stats](https://github.com/LeaPhant/skyblock-stats).

**Development Website**: https://cupcake.shiiyu.moe \
**Production Website**: https://sky.shiiyu.moe

<h2 align="center">Contributing</h1>

You are free to report bugs or contribute to this project. Just open <a href="../../issues">Issues</a> or <a href="../../pulls">Pull Requests</a> and the team will look into them.

<h3>Prerequisites</h3>

- <a href="https://nodejs.org/">Node.js</a> 20+ and <a href="https://pnpm.io/">pnpm</a> 9.4+ installed
- Existing <a href="https://docs.mongodb.com/manual/administration/install-community/">MongoDB</a> and <a href="https://redis.io/">Redis</a> servers to connect to, or <a href="https://docs.docker.com/desktop/">Docker</a> for an easier setup
- A valid <a href="https://api.hypixel.net/">Hypixel API</a> Key
  - Obtain a temporary development key on Hypixel's [Developer Dashboard](https://developer.hypixel.net/dashboard)
  - A permanent key can be requested on the same page, but are meant for active projects and not sporadic use and require approval
- Optional for a production deployment:
  - A domain name and a server to host the website
  - Valid SSL certificates for HTTPS
  - A reverse proxy like <a href="https://www.nginx.com/">Nginx</a> for web requests and load balancing

<h3>Project Setup</h3>

1. Clone the project and run `pnpm i` to install the dependencies.
   - If missing `pnpm`, you can install it with `npm i -g pnpm`
2. Copy the `.env.example` file to a new `.env` file.
   1. Fill in your Hypixel API Key
   ```sh
   HYPIXEL_API_KEY="KEY"
   ```
   2. If you are using the easier Docker setup for MongoDB and Redis, you can leave the default values. Otherwise adjust the connection values to match your setup.
   3. The Discord Webhook URL is optional and can be left alone
3. Start the MongoDB and Redis servers
   - To do this, run `docker compose up -d` in the project directory
   - If you are using your own servers, just make sure they are running
4. Run `pnpm run dev` to start the website in development mode
   - The website will be available at <a href="http://localhost:5173">http://localhost:5173</a>

<h3>Contributing Changes</h3>

When contributing changes, the following checks must pass:

- `pnpm run lint` to check for code style issues
  - Use `pnpm run format` to automatically fix formatting issues
- `pnpm run check` to run more extensive checks
- `pnpm run build` to make sure the project builds correctly

If these checks pass, you can open a pull request with your changes! These checks are also run automatically on pull requests, but it's good to check locally first.

<h2 align="center">Credits</h2>

- **Custom Textures**:
  - [FurfSky Reborn](https://hypixel.net/threads/4101579) by The Reborn Team
  - [RNBW+](https://hypixel.net/threads/3470904) by rainbowcraft2
  - [Hypixel Skyblock Pack](https://hypixel.net/threads/2103515) by Packs HQ
  - [Hypixel Plus](https://hypixel.net/threads/4174260) by ic22487
  - [Vanilla+](https://hypixel.net/threads/2147652) by TBlazeWarriorT
  - [Worlds and Beyond](https://hypixel.net/threads/3597207) by Skeletony\_
  - [Default Minecraft Textures](https://www.minecraft.net/) by Mojang
- **Player Heads**: [SkyBlock](https://hypixel.net/forums/skyblock.157/) by Hypixel
- **Original Site**: [sky.lea.moe](https://sky.lea.moe/) by LeaPhant

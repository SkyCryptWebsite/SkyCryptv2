# Changelog

## 4.4.0

### Minor Changes

- API keys now work against the backend API, which moved to api.shiiyu.moe. The API docs links point to its new home. _[`#367`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/367) [`5a52f6d`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/5a52f6de32e7100c66e011f90086a3d9683b223a) [@DarthGigi](https://github.com/DarthGigi)_

## 4.4.0-beta.0

### Minor Changes

- API keys now work against the backend API, which moved to api.shiiyu.moe. The API docs links point to its new home. _[`#367`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/367) [`5a52f6d`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/5a52f6de32e7100c66e011f90086a3d9683b223a) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0

### Minor Changes

- Add a staff admin dashboard with trial moderator, moderator, head moderator and admin roles, review queues for API access and rate limit requests, API key and user management, and an audit log of staff actions _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`a2a581d`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a2a581d688a286dab8296c0ddf0f366e7084c5e8) [@DarthGigi](https://github.com/DarthGigi)_
- Admin dashboard: API key detail pages with editable name, scopes and metadata, key deletion, a developer mode toggle for users, and automatic bans for accounts that link a banned user's Minecraft account. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`843685f`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/843685f074bc03373f2214159789502fb7d5396d) [@DarthGigi](https://github.com/DarthGigi)_
- Add a Beta Version switch to the settings. The beta now runs on sky.shiiyu.moe for visitors who turn it on, and cupcake.shiiyu.moe redirects to sky.shiiyu.moe. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`648ab0e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/648ab0e061f085a2f8a82d9e734a6f9f2318d064) [@DarthGigi](https://github.com/DarthGigi)_
- Replace Payload CMS with a built-in newsroom: admins write, schedule and publish posts in the admin dashboard with a rich text editor, keep a publish history, and manage site-wide banners that reach open pages live. Post authors show their Minecraft account, with their Discord profile on hover or tap _[`#359`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/359) [`a3ae439`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a3ae4395144bae7a95b8e6830cf8bbfa581a80ee) [@DarthGigi](https://github.com/DarthGigi)_
- Feat: migrate to sveltekit v3 _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`17d5428`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/17d542800a6fde71b91fb0e11655df2c0262d95b) [@DarthGigi](https://github.com/DarthGigi)_
- Add developer mode with a dashboard developer section where users can request API access, generate or regenerate an API key after admin approval, request rate limit increases and open the API docs _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`036494e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/036494ef24303116751872e75759b2ace71eedb4) [@DarthGigi](https://github.com/DarthGigi)_
- Store Discord username, primary guild, and avatar, banner, and avatar decoration hashes in an application-owned table, refresh them after successful Discord sign-in, and expose them through the custom session. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Add structured logging with evlog: one wide event per request (with the signed-in user), readable text output in the container logs, and optional shipping to Grafana Loki via `LOKI_ENDPOINT`. Server `console.*` calls now use evlog. _[`#357`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/357) [`dbc47c6`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/dbc47c656ce1a3a8b3e64403ad73c9336ba50ced) [@DarthGigi](https://github.com/DarthGigi)_
- Complete the dashboard with account linking, profile and session settings, and Patreon membership details. Move dashboard loading and membership verification to authenticated remote functions. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_

  Refine dashboard navigation, account connections, donator benefit previews, and mobile session settings.

- Store Minecraft accounts returned by MC-ID separately from authentication accounts. Sync UUIDs, usernames, and primary-account status after linking, and add a dashboard sync action with token refresh and reconnect support. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Anyone can now create a SkyCrypt account with Discord; the sign-up whitelist is gone. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`ab32c3b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/ab32c3b21e51145a71470071990042bab9091593) [@DarthGigi](https://github.com/DarthGigi)_
- Let verified Minecraft accounts choose and save permanent profile emojis from Patreon support or existing UUID grants. Add colored heart selection, a searchable emoji picker with skin tones, custom emoji validation, profile previews, and emoji display on stats pages. Refresh the donator perks page, correct donation amounts to USD, automatically check support after linking Patreon, and store the verification countdown in localStorage while enforcing the rate limit in server memory. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Remove profile editing from settings, improve the active sessions list, and add personal data export and account deletion. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Add an avatar and account menu to the dashboard sidebar footer with account settings and sign-out actions. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_

### Patch Changes

- Speed up stats pages and cards: the profile and embed load in parallel, card renders skip the username lookup and are capped under bursts, and banners and latest posts are shared across open pages instead of queried per visitor. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`00a26eb`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/00a26eb55dd07c7ddb43971178314b17f9aa483a) [@DarthGigi](https://github.com/DarthGigi)_
- Feat: migrate to sentry v11 _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`79e390c`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/79e390ceb1d9adb9b73e4367cac961fc24879c2e) [@DarthGigi](https://github.com/DarthGigi)_
- Render emojis progressively and cache search terms to reduce emoji picker opening and search work while preserving substring search and allowed emoji restrictions. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_

  Initialize the profile emoji picker inside its popover so the first emoji is highlighted and its footer preview appears when opening.

- Validate profile emoji inputs in the server save helper and check stored entitlement levels before displaying emojis. Reject unsupported entitlement levels. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Ship logs to HyperDX instead of Grafana Loki (`HYPERDX_OTLP_ENDPOINT` and `HYPERDX_API_KEY` replace `LOKI_*`). _[`#358`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/358) [`858e64b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/858e64bc93ca2c841aaea83d44083ad49b6112c1) [@DarthGigi](https://github.com/DarthGigi)_
- Make stats pages much lighter: the icon font drops from 2 MB to 69 KB, the enchanted glint is a 31 KB animated AVIF instead of a 730 KB GIF, and the 3D skin viewer, settings panes, theme editor and card builder load only when used. Signed-in requests no longer run extra database queries for the session, and card renders queue under load instead of failing. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`941a56c`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/941a56cff14198e12468091c917e3477f486f617) [@DarthGigi](https://github.com/DarthGigi)_
- Harden the theme image proxy against requests to internal addresses, including via DNS and redirects, and cap image size while streaming. Load the card builder only when it is opened, and drop unpublished posts from the sitemap without a restart. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`65bacc5`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/65bacc5a248d49ed7e92a52f5824db6545b62515) [@DarthGigi](https://github.com/DarthGigi)_
- Feat: remove Sentry _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`6b255d1`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/6b255d172e7f142fe341fcef62c4cee04f2ff2cc) [@DarthGigi](https://github.com/DarthGigi)_
- Stop player and profile names from reaching other backend routes: invalid names on stats pages now return 404, and backend request paths are escaped so `.` and `..` can no longer be normalized away. Client-side navigation between profiles no longer waits for the Discord embed data. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`a5e2966`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a5e2966a49e43da15efd95db8fc2e19040643e27) [@DarthGigi](https://github.com/DarthGigi)_
- Load max-level enchantments from the backend constants API. _[`#345`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/345) [`22b69c9`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/22b69c9714324955032928be83287ba66390a3bc) [@cataladev](https://github.com/cataladev)_
- Preload the main Montserrat font so body text renders sooner, and cache in-site card previews for five minutes. _[`#361`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/361) [`3fa9bd5`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/3fa9bd5c3799f4cb6911a0d88a99d5c7d191e4d9) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.10

### Minor Changes

- Add a Beta Version switch to the settings. The beta now runs on sky.shiiyu.moe for visitors who turn it on, and cupcake.shiiyu.moe redirects to sky.shiiyu.moe. _[`648ab0e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/648ab0e061f085a2f8a82d9e734a6f9f2318d064) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.9

### Patch Changes

- Speed up stats pages and cards: the profile and embed load in parallel, card renders skip the username lookup and are capped under bursts, and banners and latest posts are shared across open pages instead of queried per visitor. _[`00a26eb`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/00a26eb55dd07c7ddb43971178314b17f9aa483a) [@DarthGigi](https://github.com/DarthGigi)_
- Make stats pages much lighter: the icon font drops from 2 MB to 69 KB, the enchanted glint is a 31 KB animated AVIF instead of a 730 KB GIF, and the 3D skin viewer, settings panes, theme editor and card builder load only when used. Signed-in requests no longer run extra database queries for the session, and card renders queue under load instead of failing. _[`941a56c`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/941a56cff14198e12468091c917e3477f486f617) [@DarthGigi](https://github.com/DarthGigi)_
- Harden the theme image proxy against requests to internal addresses, including via DNS and redirects, and cap image size while streaming. Load the card builder only when it is opened, and drop unpublished posts from the sitemap without a restart. _[`65bacc5`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/65bacc5a248d49ed7e92a52f5824db6545b62515) [@DarthGigi](https://github.com/DarthGigi)_
- Stop player and profile names from reaching other backend routes: invalid names on stats pages now return 404, and backend request paths are escaped so `.` and `..` can no longer be normalized away. Client-side navigation between profiles no longer waits for the Discord embed data. _[`a5e2966`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a5e2966a49e43da15efd95db8fc2e19040643e27) [@DarthGigi](https://github.com/DarthGigi)_
- Preload the main Montserrat font so body text renders sooner, and cache in-site card previews for five minutes. _[`3fa9bd5`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/3fa9bd5c3799f4cb6911a0d88a99d5c7d191e4d9) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.8

### Minor Changes

- Anyone can now create a SkyCrypt account with Discord; the sign-up whitelist is gone. _[`ab32c3b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/ab32c3b21e51145a71470071990042bab9091593) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.7

### Minor Changes

- Admin dashboard: API key detail pages with editable name, scopes and metadata, key deletion, a developer mode toggle for users, and automatic bans for accounts that link a banned user's Minecraft account. _[`843685f`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/843685f074bc03373f2214159789502fb7d5396d) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.6

### Minor Changes

- Replace Payload CMS with a built-in newsroom: admins write, schedule and publish posts in the admin dashboard with a rich text editor, keep a publish history, and manage site-wide banners that reach open pages live. Post authors show their Minecraft account, with their Discord profile on hover or tap _[`#359`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/359) [`a3ae439`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a3ae4395144bae7a95b8e6830cf8bbfa581a80ee) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.5

### Minor Changes

- Add a staff admin dashboard with trial moderator, moderator, head moderator and admin roles, review queues for API access and rate limit requests, API key and user management, and an audit log of staff actions _[`a2a581d`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a2a581d688a286dab8296c0ddf0f366e7084c5e8) [@DarthGigi](https://github.com/DarthGigi)_
- Add developer mode with a dashboard developer section where users can request API access, generate or regenerate an API key after admin approval, request rate limit increases and open the API docs _[`036494e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/036494ef24303116751872e75759b2ace71eedb4) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.4

### Patch Changes

- Ship logs to HyperDX instead of Grafana Loki (`HYPERDX_OTLP_ENDPOINT` and `HYPERDX_API_KEY` replace `LOKI_*`). _[`#358`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/358) [`858e64b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/858e64bc93ca2c841aaea83d44083ad49b6112c1) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.3

### Minor Changes

- Add structured logging with evlog: one wide event per request (with the signed-in user), readable text output in the container logs, and optional shipping to Grafana Loki via `LOKI_ENDPOINT`. Server `console.*` calls now use evlog. _[`#357`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/357) [`dbc47c6`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/dbc47c656ce1a3a8b3e64403ad73c9336ba50ced) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.2

### Patch Changes

- Load max-level enchantments from the backend constants API. _[`#345`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/345) [`22b69c9`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/22b69c9714324955032928be83287ba66390a3bc) [@cataladev](https://github.com/cataladev)_

## 4.3.0-beta.1

### Patch Changes

- Feat: remove Sentry _[`6b255d1`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/6b255d172e7f142fe341fcef62c4cee04f2ff2cc) [@DarthGigi](https://github.com/DarthGigi)_

## 4.3.0-beta.0

### Minor Changes

- Feat: migrate to sveltekit v3 _[`17d5428`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/17d542800a6fde71b91fb0e11655df2c0262d95b) [@DarthGigi](https://github.com/DarthGigi)_
- Store Discord username, primary guild, and avatar, banner, and avatar decoration hashes in an application-owned table, refresh them after successful Discord sign-in, and expose them through the custom session. _[`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Complete the dashboard with account linking, profile and session settings, and Patreon membership details. Move dashboard loading and membership verification to authenticated remote functions. _[`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_

  Refine dashboard navigation, account connections, donator benefit previews, and mobile session settings.

- Store Minecraft accounts returned by MC-ID separately from authentication accounts. Sync UUIDs, usernames, and primary-account status after linking, and add a dashboard sync action with token refresh and reconnect support. _[`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Let verified Minecraft accounts choose and save permanent profile emojis from Patreon support or existing UUID grants. Add colored heart selection, a searchable emoji picker with skin tones, custom emoji validation, profile previews, and emoji display on stats pages. Refresh the donator perks page, correct donation amounts to USD, automatically check support after linking Patreon, and store the verification countdown in localStorage while enforcing the rate limit in server memory. _[`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Remove profile editing from settings, improve the active sessions list, and add personal data export and account deletion. _[`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_
- Add an avatar and account menu to the dashboard sidebar footer with account settings and sign-out actions. _[`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_

### Patch Changes

- Feat: migrate to sentry v11 _[`79e390c`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/79e390ceb1d9adb9b73e4367cac961fc24879c2e) [@DarthGigi](https://github.com/DarthGigi)_
- Render emojis progressively and cache search terms to reduce emoji picker opening and search work while preserving substring search and allowed emoji restrictions. _[`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_

  Initialize the profile emoji picker inside its popover so the first emoji is highlighted and its footer preview appears when opening.

- Validate profile emoji inputs in the server save helper and check stored entitlement levels before displaying emojis. Reject unsupported entitlement levels. _[`4468767`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4468767b8434af2c7737b8d18d1883640db05d1b) [@DarthGigi](https://github.com/DarthGigi)_

## 4.2.0

### Minor Changes

- Feat: redesign discord embeds _[`#352`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/352) [`9fdabac`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/9fdabace1d71cfdc3dbab5f2cf7a1c685ceec8e3) [@DarthGigi](https://github.com/DarthGigi)_

## 4.2.0-beta.0

### Minor Changes

- Feat: redesign discord embeds _[`9fdabac`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/9fdabace1d71cfdc3dbab5f2cf7a1c685ceec8e3) [@DarthGigi](https://github.com/DarthGigi)_

## 4.1.1

### Patch Changes

- Use the player's rank color for Discord component embeds, preferring the plus color and falling back to the default preview color when no valid rank color is available. _[`#349`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/349) [`c027c31`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c027c31cc48c2f260004d4d0f7dc032063c3af25) [@DarthGigi](https://github.com/DarthGigi)_

## 4.1.1-beta.0

### Patch Changes

- Use the player's rank color for Discord component embeds, preferring the plus color and falling back to the default preview color when no valid rank color is available. _[`c027c31`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c027c31cc48c2f260004d4d0f7dc032063c3af25) [@DarthGigi](https://github.com/DarthGigi)_

## 4.1.0

### Minor Changes

- Use the new component embeds for discord embeds _[`#347`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/347) [`6ff47f5`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/6ff47f5bf899bfacf9e4a384ac1038c83022fd0d) [@DarthGigi](https://github.com/DarthGigi)_

### Patch Changes

- Version prerendered endpoint URLs per build so updated resource packs and other static data appear without clearing browser caches. Preserve saved pack preferences and the commit-based app version, and show the separate prerender version in About. _[`#347`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/347) [`93f5414`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/93f541482372b322ceb5246b29842068fc14ec3c) [@DarthGigi](https://github.com/DarthGigi)_

## 4.1.0-beta.1

### Patch Changes

- Version prerendered endpoint URLs per build so updated resource packs and other static data appear without clearing browser caches. Preserve saved pack preferences and the commit-based app version, and show the separate prerender version in About. _[`93f5414`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/93f541482372b322ceb5246b29842068fc14ec3c) [@DarthGigi](https://github.com/DarthGigi)_

## 4.1.0-beta.0

### Minor Changes

- Use the new component embeds for discord embeds _[`6ff47f5`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/6ff47f5bf899bfacf9e4a384ac1038c83022fd0d) [@DarthGigi](https://github.com/DarthGigi)_

## 4.0.0

### Major Changes

- Feat: V4 Release _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`2a5f4c6`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2a5f4c62880eab472db5977ed5dc544fee9fcd1a) [@DarthGigi](https://github.com/DarthGigi)_

### Minor Changes

- Add dual-mode custom themes with V5 schema migration and mode-watcher-driven light/dark switching. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`c30f460`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c30f460ebe9ae6c65d7fcd5442698fb56ab0809f) [@DarthGigi](https://github.com/DarthGigi)_

### Patch Changes

- Detect unavailable hardware graphics acceleration and lock Performance Mode to avoid expensive visual effects. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`a2ded10`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a2ded10e2a04758d92781b38372c04d8ea21dcd2) [@DarthGigi](https://github.com/DarthGigi)_
- Show structured skill gear, equipment wardrobes, and saved loadouts from the SkyCrypt API. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`bded902`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/bded902e0f96c80dec70fc6f6c7a7097183b5740) [@DarthGigi](https://github.com/DarthGigi)_
- Move app.css to routes/layout.css _[`#335`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/335) [`2ba7841`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2ba78417b17abb4815b78655d529835bd6e34568) [@DarthGigi](https://github.com/DarthGigi)_
- Restore mobile drawer visibility by keeping drawer content anchored to the viewport. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`3badaae`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/3badaae1d68bb78b333a5b6208dae829e86e7924) [@DarthGigi](https://github.com/DarthGigi)_
- Replace native settings list scrollbars with consistent custom scroll areas. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`7d05c76`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/7d05c7648dd1d202a9c32c61fd19a97157138053) [@DarthGigi](https://github.com/DarthGigi)_
- Convert performance-mode glass styling to dynamic Tailwind utilities. _[`#335`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/335) [`b7a062f`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/b7a062fc0c3034998221199af3202d76ca60c214) [@DarthGigi](https://github.com/DarthGigi)_
- Move theme selection to mode-watcher and generate runtime CSS for custom themes. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`88c623e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/88c623e5f7f85d808866a02a707404a4743de467) [@DarthGigi](https://github.com/DarthGigi)_
- Migrate sitemap generation to Super Sitemap v2. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`95548d3`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/95548d317521c0298fd379c987ef67cc30968942) [@DarthGigi](https://github.com/DarthGigi)_
- Add ordered resource-pack preferences with drag-and-drop priority, legacy migration, and vanilla-only support. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`2bc34e9`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2bc34e9ad6bd3b6d9e381ce985437de516a0c44f) [@DarthGigi](https://github.com/DarthGigi)_
- Prevent rapid section navigation from hanging the page while inventory data is loading. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`2e54f53`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2e54f533f7dfbf56a7d56c5cbd0444c698f38e34) [@DarthGigi](https://github.com/DarthGigi)_
- Restore generated card fonts and keyed images under Takumi v2. _[`#342`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/342) [`94f1d7b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/94f1d7b548d65f96e8b38ed6d2b10407060d90c2) [@DarthGigi](https://github.com/DarthGigi)_

## 4.0.0-beta.9

### Major Changes

- Feat: V4 Release _[`2a5f4c6`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2a5f4c62880eab472db5977ed5dc544fee9fcd1a) [@DarthGigi](https://github.com/DarthGigi)_

## 3.9.0-beta.8

### Patch Changes

- Prevent rapid section navigation from hanging the page while inventory data is loading. _[`2e54f53`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2e54f533f7dfbf56a7d56c5cbd0444c698f38e34) [@DarthGigi](https://github.com/DarthGigi)_

## 3.9.0-beta.7

### Patch Changes

- Restore mobile drawer visibility by keeping drawer content anchored to the viewport. _[`3badaae`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/3badaae1d68bb78b333a5b6208dae829e86e7924) [@DarthGigi](https://github.com/DarthGigi)_
- Add ordered resource-pack preferences with drag-and-drop priority, legacy migration, and vanilla-only support. _[`2bc34e9`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2bc34e9ad6bd3b6d9e381ce985437de516a0c44f) [@DarthGigi](https://github.com/DarthGigi)_

## 3.9.0-beta.6

### Patch Changes

- Show structured skill gear, equipment wardrobes, and saved loadouts from the SkyCrypt API. _[`bded902`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/bded902e0f96c80dec70fc6f6c7a7097183b5740) [@DarthGigi](https://github.com/DarthGigi)_

## 3.9.0-beta.5

### Patch Changes

- Detect unavailable hardware graphics acceleration and lock Performance Mode to avoid expensive visual effects. _[`a2ded10`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a2ded10e2a04758d92781b38372c04d8ea21dcd2) [@DarthGigi](https://github.com/DarthGigi)_
- Replace native settings list scrollbars with consistent custom scroll areas. _[`7d05c76`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/7d05c7648dd1d202a9c32c61fd19a97157138053) [@DarthGigi](https://github.com/DarthGigi)_

## 3.9.0-beta.4

### Patch Changes

- Migrate sitemap generation to Super Sitemap v2. _[`95548d3`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/95548d317521c0298fd379c987ef67cc30968942) [@DarthGigi](https://github.com/DarthGigi)_

## 3.9.0-beta.3

### Patch Changes

- Restore generated card fonts and keyed images under Takumi v2. _[`94f1d7b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/94f1d7b548d65f96e8b38ed6d2b10407060d90c2) [@DarthGigi](https://github.com/DarthGigi)_

## 3.9.0-beta.2

### Minor Changes

- Add dual-mode custom themes with V5 schema migration and mode-watcher-driven light/dark switching. _[`c30f460`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c30f460ebe9ae6c65d7fcd5442698fb56ab0809f) [@DarthGigi](https://github.com/DarthGigi)_

## 3.8.1-beta.1

### Patch Changes

- Move theme selection to mode-watcher and generate runtime CSS for custom themes. _[`88c623e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/88c623e5f7f85d808866a02a707404a4743de467) [@DarthGigi](https://github.com/DarthGigi)_

## 3.8.1-beta.0

### Patch Changes

- Move app.css to routes/layout.css _[`#335`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/335) [`2ba7841`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2ba78417b17abb4815b78655d529835bd6e34568) [@DarthGigi](https://github.com/DarthGigi)_
- Convert performance-mode glass styling to dynamic Tailwind utilities. _[`#335`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/335) [`b7a062f`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/b7a062fc0c3034998221199af3202d76ca60c214) [@DarthGigi](https://github.com/DarthGigi)_

## 3.8.0

### Minor Changes

- Transition SkyCrypt Frontend to GNU AGPLv3 with an MIT brand asset exception. _[`#332`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/332) [`aa63f95`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/aa63f9560dee835575456b364555486c0858f9fc) [@DarthGigi](https://github.com/DarthGigi)_

## 3.8.0-beta.0

### Minor Changes

- Transition SkyCrypt Frontend to GNU AGPLv3 with an MIT brand asset exception. _[`#332`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/332) [`aa63f95`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/aa63f9560dee835575456b364555486c0858f9fc) [@DarthGigi](https://github.com/DarthGigi)_

## 3.7.0

### Minor Changes

- Add local newsroom notifications for new CMS posts. _[`#330`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/330) [`c2b599e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c2b599e7e729a61d029f4998f736ae3fa1f0571d) [@DarthGigi](https://github.com/DarthGigi)_
- Add initial work for SkyCrypt accounts _[`#328`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/328) [`c077847`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c077847a0fbf13a8aa73122aa28e873189c172f4) [@DarthGigi](https://github.com/DarthGigi)_
- Add the CMS-backed newsroom with post listing, article pages, previews, and sitemap entries. _[`#330`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/330) [`a74b033`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a74b0339f66196ae719dbc19c06ab704995e502c) [@DarthGigi](https://github.com/DarthGigi)_

### Patch Changes

- Render newsroom posts and the listing page as `summary_large_image` social embeds with the post's hero image (or a branded graphic on the listing), and stop the homepage SEO defaults from leaking into them. _[`#330`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/330) [`793cd0e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/793cd0ef92bdc01a1de274880f5b00487422d59a) [@DarthGigi](https://github.com/DarthGigi)_
- Migrate remote query search calls to the current SvelteKit API. _[`#330`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/330) [`31d283e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/31d283ec8c027cb27583a8bb9c026bacf01759a4) [@DarthGigi](https://github.com/DarthGigi)_
- Eliminate `derived_inert` runtime warnings by hoisting `new IsInViewport(...)` out of a `$derived` in `Chip.svelte` and splitting `getThemeIcons(...).current` in the header. Align remaining stats-view remote queries with the post-2.61 docs idiom (`await` for template/context-feed sites; `.current`/`.loading`/`.error` kept only for the loading-button-spinner case). Drop the redundant `getCombined()` in `Sections.svelte`. Make the navbar's tab scroll-on-mount race-resistant and its `IntersectionObserver` `rootMargin` NaN-safe. _[`#330`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/330) [`d99d081`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/d99d0812879edad2cd6cdcfc5a60e925099c61fc) [@DarthGigi](https://github.com/DarthGigi)_
- Render newsroom rich text with Payload's Lexical HTML converter while preserving SkyCrypt-specific links, uploads, checklists, and relationship nodes. _[`#330`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/330) [`0ae985e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/0ae985e966ec97090b050f4d4607f516359bedd5) [@DarthGigi](https://github.com/DarthGigi)_

## 3.7.0-beta.3

### Patch Changes

- Render newsroom posts and the listing page as `summary_large_image` social embeds with the post's hero image (or a branded graphic on the listing), and stop the homepage SEO defaults from leaking into them. _[`793cd0e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/793cd0ef92bdc01a1de274880f5b00487422d59a) [@DarthGigi](https://github.com/DarthGigi)_
- Eliminate `derived_inert` runtime warnings by hoisting `new IsInViewport(...)` out of a `$derived` in `Chip.svelte` and splitting `getThemeIcons(...).current` in the header. Align remaining stats-view remote queries with the post-2.61 docs idiom (`await` for template/context-feed sites; `.current`/`.loading`/`.error` kept only for the loading-button-spinner case). Drop the redundant `getCombined()` in `Sections.svelte`. Make the navbar's tab scroll-on-mount race-resistant and its `IntersectionObserver` `rootMargin` NaN-safe. _[`d99d081`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/d99d0812879edad2cd6cdcfc5a60e925099c61fc) [@DarthGigi](https://github.com/DarthGigi)_

## 3.7.0-beta.2

### Patch Changes

- Migrate remote query search calls to the current SvelteKit API. ([`31d283e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/31d283ec8c027cb27583a8bb9c026bacf01759a4))

- Render newsroom rich text with Payload's Lexical HTML converter while preserving SkyCrypt-specific links, uploads, checklists, and relationship nodes. ([`0ae985e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/0ae985e966ec97090b050f4d4607f516359bedd5))

## 3.7.0-beta.1

### Minor Changes

- Add local newsroom notifications for new CMS posts. ([`c2b599e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c2b599e7e729a61d029f4998f736ae3fa1f0571d))

- Add the CMS-backed newsroom with post listing, article pages, previews, and sitemap entries. ([`a74b033`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a74b0339f66196ae719dbc19c06ab704995e502c))

## 3.7.0-beta.0

### Minor Changes

- Add initial work for SkyCrypt accounts ([#328](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/328))

## 3.6.2

### Patch Changes

- Stop the production container restart loop caused by unhandled promise rejections under Node 24. Two changes: (1) the `/stats/[ign]/[[profile]]/card` endpoint now uses `Promise.allSettled` rather than `Promise.all` for the parallel `getProfileStats` / `getNetworth` / `getCombined` calls — when one rejects first, the losing-side promises no longer become orphaned rejections that crash the process. (2) A `process.on("unhandledRejection")` safety net in `instrumentation.server.ts` logs + reports any future orphans to Sentry instead of exiting, since Node 24's default `--unhandled-rejections=throw` is fatal. Combined this ends the ~2-minute restart cycle visible in production logs. ([#326](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/326))

## 3.6.2-beta.0

### Patch Changes

- Stop the production container restart loop caused by unhandled promise rejections under Node 24. Two changes: (1) the `/stats/[ign]/[[profile]]/card` endpoint now uses `Promise.allSettled` rather than `Promise.all` for the parallel `getProfileStats` / `getNetworth` / `getCombined` calls — when one rejects first, the losing-side promises no longer become orphaned rejections that crash the process. (2) A `process.on("unhandledRejection")` safety net in `instrumentation.server.ts` logs + reports any future orphans to Sentry instead of exiting, since Node 24's default `--unhandled-rejections=throw` is fatal. Combined this ends the ~2-minute restart cycle visible in production logs. ([`9ffadbc`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/9ffadbcf6e4c5730756a06039dc23cf9a56eda98))

## 3.6.1

### Patch Changes

- Render the JSON-LD `<script type="application/ld+json">` block via `<svelte:element>` instead of `{@html}`, dropping the closing-tag-splitting workaround. The XSS-safe `safeJsonLd` escaping (`<` / `>` / `&`) is unchanged and still preserves data fidelity, so crawlers see exactly the same JSON content as before. ([#324](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/324))

- Restore the card background and inline-emoji rendering after upgrading to `takumi-js@1.1.x`. The underlying Rust crate's commit `adc48da` ("Treat absolute/floated children as out-of-flow for inline layout detection") reworked which children participate in inline formatting context, leaving the previous `<img class="absolute inset-0">` background unrendered — which made the white text and emoji appear to vanish too. The persistent image is now applied as `background-image` CSS on the parent `<main>`, matching the pattern shown in the takumi docs. ([#324](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/324))

- Escape JSON-LD payload so user-controlled fields (e.g. the `ign` URL parameter on stats pages) cannot break out of the `<script type="application/ld+json">` tag. `svelte-seo`'s `jsonLd` prop emits `JSON.stringify(data)` raw, and `JSON.stringify` does not escape `<`, `>` or `&` — so visiting `/stats/<script>alert(1)</script>` was enough to inject arbitrary HTML/JS into `<head>`. The new `JsonLd` component escapes those three characters to their unicode escapes (still valid JSON) before emitting the tag. ([#324](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/324))

- Harden security headers against iframe-based phishing. The phishing site `sky.shiiiyu.moe` was embedding the real site in an invisible cross-origin iframe and rewriting `history.pushState` to disguise the URL bar. The fix layers three browser-enforced controls: `Content-Security-Policy: frame-ancestors 'self'` (modern browsers) and `X-Frame-Options: DENY` (older-browser fallback) refuse the iframe outright, and `Cross-Origin-Opener-Policy: same-origin` isolates the top-level browsing context group so a malicious opener cannot reach back via `window.opener`. The `/api/*` surface is unaffected — partner integrations (e.g., Lunar Client) that call the Go backend directly continue to work. ([#324](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/324))

## 3.6.1-beta.2

### Patch Changes

- Harden security headers against iframe-based phishing. The phishing site `sky.shiiiyu.moe` was embedding the real site in an invisible cross-origin iframe and rewriting `history.pushState` to disguise the URL bar. The fix layers three browser-enforced controls: `Content-Security-Policy: frame-ancestors 'self'` (modern browsers) and `X-Frame-Options: DENY` (older-browser fallback) refuse the iframe outright, and `Cross-Origin-Opener-Policy: same-origin` isolates the top-level browsing context group so a malicious opener cannot reach back via `window.opener`. The `/api/*` surface is unaffected — partner integrations (e.g., Lunar Client) that call the Go backend directly continue to work. ([`43736ae`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/43736ae30e223ad18c6281484d728fafa2279365))

## 3.6.1-beta.1

### Patch Changes

- Render the JSON-LD `<script type="application/ld+json">` block via `<svelte:element>` instead of `{@html}`, dropping the closing-tag-splitting workaround. The XSS-safe `safeJsonLd` escaping (`<` / `>` / `&`) is unchanged and still preserves data fidelity, so crawlers see exactly the same JSON content as before. ([`263c4f3`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/263c4f3560c04b0cbbdf288e5c7cfc780050665b))

## 3.6.1-beta.0

### Patch Changes

- Restore the card background and inline-emoji rendering after upgrading to `takumi-js@1.1.x`. The underlying Rust crate's commit `adc48da` ("Treat absolute/floated children as out-of-flow for inline layout detection") reworked which children participate in inline formatting context, leaving the previous `<img class="absolute inset-0">` background unrendered — which made the white text and emoji appear to vanish too. The persistent image is now applied as `background-image` CSS on the parent `<main>`, matching the pattern shown in the takumi docs. ([`176b8c2`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/176b8c2296f3c79a1a217515f30a4d531fef9644))

- Escape JSON-LD payload so user-controlled fields (e.g. the `ign` URL parameter on stats pages) cannot break out of the `<script type="application/ld+json">` tag. `svelte-seo`'s `jsonLd` prop emits `JSON.stringify(data)` raw, and `JSON.stringify` does not escape `<`, `>` or `&` — so visiting `/stats/<script>alert(1)</script>` was enough to inject arbitrary HTML/JS into `<head>`. The new `JsonLd` component escapes those three characters to their unicode escapes (still valid JSON) before emitting the tag. ([`5452ef7`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/5452ef74f36f90789224c53793444dfbc2297a74))

## 3.6.0

### Minor Changes

- Remove the official wiki and use the new independent wiki #317. Thanks @DespicableGoose! ([#318](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/318))

## 3.6.0-beta.0

### Minor Changes

- Remove the official wiki and use the new independent wiki #317. Thanks @DespicableGoose! ([`ac42e56`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/ac42e5654b867a6e91e0310ee02e3f90d89313f7))

## 3.5.2

### Patch Changes

- Fix remaining SvelteKit remote query lifecycle regressions by replacing stored live query instances with plain reactive snapshots in the stats route, combined section loading, inventory, networth, additional stats, and header theme icon flows. This aligns the app more closely with the stricter remote query behavior introduced around sveltejs/kit#15533 and prevents inactive query access during tab and section transitions. ([#315](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/315))

- Improve the mobile stats header and profile action layout by collapsing the search trigger earlier on small screens and keeping the expanded profile actions inline with the always-visible buttons while preserving their staggered animation timing. ([#315](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/315))

## 3.5.2-beta.0

### Patch Changes

- Fix remaining SvelteKit remote query lifecycle regressions by replacing stored live query instances with plain reactive snapshots in the stats route, combined section loading, inventory, networth, additional stats, and header theme icon flows. This aligns the app more closely with the stricter remote query behavior introduced around sveltejs/kit#15533 and prevents inactive query access during tab and section transitions. ([`3dd3f2f`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/3dd3f2fa7d77e2668c90755ec5e18933838c2752))

- Improve the mobile stats header and profile action layout by collapsing the search trigger earlier on small screens and keeping the expanded profile actions inline with the always-visible buttons while preserving their staggered animation timing. ([`c677cbb`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c677cbb95be31fcb9887beca90cdb607ade05efd))

## 3.5.1

### Patch Changes

- Fix SvelteKit 2.56 remote query lifecycle regressions by keeping the combined profile query local to the consuming components instead of passing a live query instance through context. This aligns the app with the remote function tracking changes from sveltejs/kit#15533 and the related refresh model changes in sveltejs/kit#15562. ([#313](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/313))

- Reduce Svelte 5 `await_reactivity_loss` warnings after the SvelteKit remote function changes by keeping profile, networth, theme icon, and performance-mode reads in non-async reactive paths. This aligns the affected UI with the stricter query lifecycle introduced around sveltejs/kit#15533. ([#313](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/313))

- Fix search flows after the SvelteKit remote query changes in sveltejs/kit#15533 by switching the home page and command palette to imperative `query().run()` calls with client-side navigation. This removes duplicate search requests, avoids redirect errors from reactive query usage, and resets command palette search state correctly. ([#313](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/313))

- Fix the settings drag-and-drop lists after the `@dnd-kit/svelte` 0.4.0 upgrade by restoring stable sortable behavior with the updated plugin configuration and provider lifecycle handling. This keeps whole-row dragging working reliably in the Order and Misc settings tabs. ([#313](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/313))

## 3.5.1-beta.1

### Patch Changes

- Fix the settings drag-and-drop lists after the `@dnd-kit/svelte` 0.4.0 upgrade by restoring stable sortable behavior with the updated plugin configuration and provider lifecycle handling. This keeps whole-row dragging working reliably in the Order and Misc settings tabs. ([`0f2bb4b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/0f2bb4b7f99c46b6beb969e4ba07ee4b6c5eaee8))

## 3.5.1-beta.0

### Patch Changes

- Fix SvelteKit 2.56 remote query lifecycle regressions by keeping the combined profile query local to the consuming components instead of passing a live query instance through context. This aligns the app with the remote function tracking changes from sveltejs/kit#15533 and the related refresh model changes in sveltejs/kit#15562. ([`b0727e1`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/b0727e181cc07f6dd3f349623c0dbc84a1e45ffc))

- Reduce Svelte 5 `await_reactivity_loss` warnings after the SvelteKit remote function changes by keeping profile, networth, theme icon, and performance-mode reads in non-async reactive paths. This aligns the affected UI with the stricter query lifecycle introduced around sveltejs/kit#15533. ([`eb72f4a`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/eb72f4a9a43a0f342822fc4c7d86254b6a029f41))

- Fix search flows after the SvelteKit remote query changes in sveltejs/kit#15533 by switching the home page and command palette to imperative `query().run()` calls with client-side navigation. This removes duplicate search requests, avoids redirect errors from reactive query usage, and resets command palette search state correctly. ([`b0727e1`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/b0727e181cc07f6dd3f349623c0dbc84a1e45ffc))

## 3.5.0

### Minor Changes

- feat: use the combined endpoint for the sections data ([#310](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/310))

- feat: refactor inventory components to improve data fetching and rendering logic ([#310](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/310))

### Patch Changes

- fix: refactor SectionBoundary to use query function instead of promise ([#310](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/310))

## 3.5.0-beta.0

### Minor Changes

- feat: use the combined endpoint for the sections data ([`638f564`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/638f564eb6e904eb08b847460d95ab430f4c26aa))

- feat: refactor inventory components to improve data fetching and rendering logic ([`2c80f2d`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2c80f2d153a3cbd324f307458e4a43ee99c1d852))

### Patch Changes

- fix: refactor SectionBoundary to use query function instead of promise ([`bd7398b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/bd7398b93213bbd0db3ca24ba83bbb79c7765b7e))

## 3.4.1

### Patch Changes

- fix: move hunting shards into skills and improve the hunting shard browser ([#304](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/304))

- fix: sync disabled packs localstorage with cookies ([#304](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/304))

- feat: migrate to takumi-js for image rendering and update dependencies ([#304](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/304))

## 3.4.1-beta.0

### Patch Changes

- fix: move hunting shards into skills and improve the hunting shard browser ([`8a92a87`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/8a92a87aece877a7862e91e29b7b7cddb08b54a4))

- fix: sync disabled packs localstorage with cookies ([`7fb5461`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/7fb546177a0ba08e1a89e670aa1fd7912f555370))

- feat: migrate to takumi-js for image rendering and update dependencies ([`5de35f4`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/5de35f4a6a3318fc6bdf85f9bbc35d8f99c80bcd))

## 3.4.0

### Minor Changes

- feat: add player profile card image generation ([#301](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/301))

## 3.4.0-beta.0

### Minor Changes

- feat: add player profile card image generation ([`13d3fee`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/13d3fee85df394e7ba98386acba00b095d821a6e))

## 3.3.3

### Patch Changes

- feat: add internal preferences context and survey notice component ([#298](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/298))

## 3.3.3-beta.0

### Patch Changes

- feat: add internal preferences context and survey notice component ([`b2e30ca`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/b2e30ca5fab61fb2eb6c7cba602b61d3476821e2))

## 3.3.2

### Patch Changes

- feat: enhance mcTextToHTML for improved color handling and formatting resets ([#296](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/296))

- feat: add tailwindcss-motion for enhanced animations and transitions ([#296](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/296))

## 3.3.2-beta.1

### Patch Changes

- feat: add tailwindcss-motion for enhanced animations and transitions ([`46061dc`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/46061dc0a6661c753cda83575663c40b6e2bbbe9))

## 3.3.2-beta.0

### Patch Changes

- feat: enhance mcTextToHTML for improved color handling and formatting resets ([`760184c`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/760184c4b2af63069f29ba64fd82eb356cdfd385))

## 3.3.1

### Patch Changes

- feat: include package version in site name for SEO component ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

- refactor: remove unused theme context import and use derived theme color in SEO component ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

- fix: replace createHover with manual hover state management in Skillbar component ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

- feat: add super-sitemap package and implement sitemap generation for contributors ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

- feat: enhance SEO and structured data for profile and website pages ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

- chore: enhance headers for SEO in hooks.server.ts ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

- feat: add package version display in header and info components ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

- feat: migrate to @dndkit from svelte-dnd-action ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

- feat: add rank in getLongDescription function ([#291](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/291))

## 3.3.1-beta.6

### Patch Changes

- feat: include package version in site name for SEO component ([`29a7a11`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/29a7a115635c76baea0230e341b67b4ff409d603))

- refactor: remove unused theme context import and use derived theme color in SEO component ([`e9d6101`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/e9d61018a4d39200a02f02dd63e5166320c71209))

- fix: replace createHover with manual hover state management in Skillbar component ([`133d0c8`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/133d0c82290885b03a8b6ec908f9aff9588e0a3c))

- feat: add super-sitemap package and implement sitemap generation for contributors ([`556d4d0`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/556d4d0a41756905062158e8370dd2566e481825))

- feat: enhance SEO and structured data for profile and website pages ([`45cc57f`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/45cc57fdb93dddfce7f7679b7a959e056e7ae6d1))

- chore: enhance headers for SEO in hooks.server.ts ([`6168439`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/61684397e3defce3cc261d04f78b6af9513e5736))

- feat: add package version display in header and info components ([`2b11d15`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2b11d15bcf45fceb2d49cc5238c54c3b8c1355bd))

- feat: migrate to @dndkit from svelte-dnd-action ([`af1100b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/af1100bc4f2c982e4d58d705a456cb23f927d810))

- feat: add rank in getLongDescription function ([`db3c2fe`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/db3c2fee0dff224ff9ff1e712858f3799412a3ab))

## 3.3.1-beta.5

### Patch Changes

- feat: include package version in site name for SEO component ([`29a7a11`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/29a7a115635c76baea0230e341b67b4ff409d603))

- refactor: remove unused theme context import and use derived theme color in SEO component ([`e9d6101`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/e9d61018a4d39200a02f02dd63e5166320c71209))

- feat: add package version display in header and info components ([`2b11d15`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/2b11d15bcf45fceb2d49cc5238c54c3b8c1355bd))

- feat: add rank in getLongDescription function ([`db3c2fe`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/db3c2fee0dff224ff9ff1e712858f3799412a3ab))

## 3.3.1-beta.4

### Patch Changes

- feat: add super-sitemap package and implement sitemap generation for contributors ([`556d4d0`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/556d4d0a41756905062158e8370dd2566e481825))

- feat: enhance SEO and structured data for profile and website pages ([`45cc57f`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/45cc57fdb93dddfce7f7679b7a959e056e7ae6d1))

- chore: enhance headers for SEO in hooks.server.ts ([`6168439`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/61684397e3defce3cc261d04f78b6af9513e5736))

## 3.3.1-beta.3

### Patch Changes

- fix: replace createHover with manual hover state management in Skillbar component ([`133d0c8`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/133d0c82290885b03a8b6ec908f9aff9588e0a3c))

- feat: migrate to @dndkit from svelte-dnd-action ([`af1100b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/af1100bc4f2c982e4d58d705a456cb23f927d810))

## 3.3.1

### Patch Changes

- chore: update config to match default config generated via sv@0.12.6 ([#285](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/285))

- feat: enhance CI workflows with CodeQL analysis and stable release process ([#286](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/286))

- refactor: update release workflows ([#285](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/285))

- fix: tooltip does not update when hovering over items too quickly #282 ([#285](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/285))

## 3.3.1-beta.2

### Patch Changes

- feat: enhance CI workflows with CodeQL analysis and stable release process ([`29736f0`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/29736f098d1b5c37cdd6646c5285bd44cdec6433))

## 3.3.1-beta.1

### Patch Changes

- refactor: update release workflows ([`a838fe9`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a838fe9fcd871372d2646744239e14bfe737f4fd))

## 3.3.1-beta.0

### Patch Changes

- chore: update config to match default config generated via sv@0.12.6 ([`3c5c711`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/3c5c711ecb704492fb594559fd314c4f49746c4a))

- fix: tooltip does not update when hovering over items too quickly #282 ([`7a3db55`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/7a3db556cade43fd607de0c29a18621e083ea082))

## 3.3.0

### Minor Changes

- feat: add attribute shards section ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- feat: add support for 'sacks' tab in inventory ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

### Patch Changes

- chore: update repository URL in package.json and add pnpm workspace configuration ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- fix: searching for a profile on an error page would not re-render the new page [SvelteKit Issue #15310](https://github.com/sveltejs/kit/issues/15310) ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- fix: last skillbar being misaligned when the items are even ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- feat: add lava sea creatures and differentiate between water and lava sea creatures ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- chore: remove unused static assets ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- feat: remove consumables in Misc -> Uncategorized ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- fix: pet name being always white when using mc styled tooltips ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- feat: enhance renderLore function to support options for breaking spaces and dashes ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- refactor: rename max to maxLevel in ModelsGardenChip and update references ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- feat: replace Essence component with Chips component and update API models ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- refactor: move Garden Chips from misc section to garden section ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))
  feat: add DNA Analysis Milestone to garden section
  feat: add images to garden upgrades and chips, and add max level display for chips

- fix maxed enchants only showing a different color if rightmost in their respective line ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- fix: update tooltip class for better word wrapping and adjust renderLore to support breaking spaces ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- feat: add mutations to garden ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- feat: implement tab context management, update skill sections with new tab enum, and open all collapsibles by default ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

- feat: add images to foraging tree gift chips ([#280](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/280))

## 3.3.0-beta.1

### Patch Changes

- feat: remove consumables in Misc -> Uncategorized ([`0113d81`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/0113d81bfec105eee9b1e826e48535c29809c2f9))

## 3.3.0-beta.0

### Minor Changes

- feat: add attribute shards section ([`7f8dd28`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/7f8dd287848031216cecc7239aa422930af85366))

- feat: add support for 'sacks' tab in inventory ([`07537a2`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/07537a2157305ff2e9a62e6885d20f07efeb126f))

### Patch Changes

- chore: update repository URL in package.json and add pnpm workspace configuration ([`1985230`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/1985230a947b23bcc3f2c5eb5f5e086eb376e37a))

- fix: searching for a profile on an error page would not re-render the new page [SvelteKit Issue #15310](https://github.com/sveltejs/kit/issues/15310) ([`b01cd5a`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/b01cd5a45d53bb79ffc4e31873dfc895c3048c05))

- fix: last skillbar being misaligned when the items are even ([`4f5a428`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/4f5a428469c596c4ed826d2c851a7634fa7c2d9f))

- feat: add lava sea creatures and differentiate between water and lava sea creatures ([`f375582`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/f3755826b540344c7691cc192c6ef6fce356b673))

- chore: remove unused static assets ([`d85ebca`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/d85ebcacd8e214dcbac9ac00a28bdfa83e9115d3))

- fix: pet name being always white when using mc styled tooltips ([`9319fd7`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/9319fd71de27bab022565ce68032a9233698e875))

- feat: enhance renderLore function to support options for breaking spaces and dashes ([`0f5bc72`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/0f5bc72955f43c8e7b03811fad4d45038ef57f41))

- refactor: rename max to maxLevel in ModelsGardenChip and update references ([`096911c`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/096911c9b9da791fc568d97a5c28c087721b877e))

- feat: replace Essence component with Chips component and update API models ([`1215372`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/1215372d35ac6296130666b80b320f6f35418960))

- refactor: move Garden Chips from misc section to garden section ([`a66852f`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/a66852f61f953d6a95c8f5105eb1675e5144a394))
  feat: add DNA Analysis Milestone to garden section
  feat: add images to garden upgrades and chips, and add max level display for chips

- fix maxed enchants only showing a different color if rightmost in their respective line ([`f76c675`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/f76c675b858bf9220b3aba9a2df55389d6dd1cde))

- fix: update tooltip class for better word wrapping and adjust renderLore to support breaking spaces ([`0be8b23`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/0be8b23a14ac95d3ff4146774519d9947546c62e))

- feat: add mutations to garden ([`64b10c2`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/64b10c2716a7045ceac7deb821e47e190cdb3bb1))

- feat: implement tab context management, update skill sections with new tab enum, and open all collapsibles by default ([`17632d1`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/17632d1a254800afa8062a109c0f8b2d32f8fcd7))

- feat: add images to foraging tree gift chips ([`9c7a2c7`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/9c7a2c7c70eaea012d9a5b8f5958b57878fb747b))

## 3.2.0

### Minor Changes

- feat: add garden upgrades and garden chips ([#276](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/276))

- feat: add foraging in skills section ([#276](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/276))

### Patch Changes

- refactor: add tabs to skills section ([#276](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/276))

- refactor: make image in chip component optional ([#276](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/276))

## 3.2.0-beta.3

### Minor Changes

- feat: add garden upgrades and garden chips ([`123c4eb`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/123c4ebc1940ed7702c7b25bb71b3e1caad08e37))

- feat: add foraging in skills section ([`1c3fe6b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/1c3fe6b4b6fd6411e2a2912c67811fb246b05782))

### Patch Changes

- refactor: add tabs to skills section ([`e6a3feb`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/e6a3feb7416c0d29a8fcbe9f433c1b1885629446))

- refactor: make image in chip component optional ([`c7d580c`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c7d580c060cdcc01178ec45224577708f1088370))

## 3.2.0

### Minor Changes

- Add runtime theme engine V3 with visual editor, replacing old build-time JSON theme system. Users can now create, edit, share, and manage custom themes directly on the website. Includes Zod schema validation, URL-based compressed sharing, MC color palette presets, live preview, and migration of all 11 first-party themes to the new V3 format. ([#269](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/269))

### Patch Changes

- Extracted DungeonCataCard, GardenPlotGrid, SectionBoundary, and CommandPalette (with CommandSearchGroup and CommandSettingsGroup sub-components) from large files. ([#266](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/266))

- Extracted 8 reusable components from large section files: SettingToggleRow, ContainedItemsGrid, NetworthCard, ContributorCard, ContributorCardSkeleton, CtaCard, InventorySearch, InventoryGrid. ([#266](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/266))

- Migrate tooltips to a singleton pattern ([#271](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/271))

- Reorganized component directory structure — moved 29 components into categorical subdirectories (item/, stats/, notices/, misc/, sections/). Updated 100+ import paths. ([#266](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/266))

- Added string shorthand props (text, subtitleText, tooltipContent) to Section, SectionTitle, SectionSubtitle, Notice, and Chip components. ([#266](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/266))

## 3.2.0-beta.2

### Patch Changes

- Migrate tooltips to a singleton pattern ([`9b3cfd3`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/9b3cfd32169d0539ad41d993a92a6a79ace8fa9c))

## 3.2.0-beta.1

### Minor Changes

- Add runtime theme engine V3 with visual editor, replacing old build-time JSON theme system. Users can now create, edit, share, and manage custom themes directly on the website. Includes Zod schema validation, URL-based compressed sharing, MC color palette presets, live preview, and migration of all 11 first-party themes to the new V3 format. ([#269](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/269))

## 3.1.2-beta.0

### Patch Changes

- Extracted DungeonCataCard, GardenPlotGrid, SectionBoundary, and CommandPalette (with CommandSearchGroup and CommandSettingsGroup sub-components) from large files. ([#266](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/266))

- Extracted 8 reusable components from large section files: SettingToggleRow, ContainedItemsGrid, NetworthCard, ContributorCard, ContributorCardSkeleton, CtaCard, InventorySearch, InventoryGrid. ([#266](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/266))

- Reorganized component directory structure — moved 29 components into categorical subdirectories (item/, stats/, notices/, misc/, sections/). Updated 100+ import paths. ([#266](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/266))

- Added string shorthand props (text, subtitleText, tooltipContent) to Section, SectionTitle, SectionSubtitle, Notice, and Chip components. ([#266](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/266))

## 3.1.1

### Patch Changes

- Refactor how bots and embeds are handled to prevent getting flagged for "cloaking" ([#261](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/261))

## 3.1.1-beta.0

### Patch Changes

- Refactor how bots and embeds are handled to prevent getting flagged for "cloaking" ([`c4fab6e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c4fab6ee92b10a4a136b1c87e9e350f15f9a757e))

## 3.1.0

### Minor Changes

- Migrate to changesets from changelogen ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

- Added minecraft styled tooltips ([#254](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/254))

### Patch Changes

- Changeset for PR #243 ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

- Use totalAmount instead of amount for collections ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

## 3.1.0-beta.3

### Patch Changes

- Refactor how bots and embeds are handled to prevent getting flagged for "cloaking" ([`c4fab6e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c4fab6ee92b10a4a136b1c87e9e350f15f9a757e))

- Enable link preloading again ([`8fa2660`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/8fa26605a08f45505122928ea5ea60a63374ecf0))

## 3.1.0

### Minor Changes

- Migrate to changesets from changelogen ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

- Added minecraft styled tooltips ([#254](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/254))

### Patch Changes

- Changeset for PR #243 ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

- Use totalAmount instead of amount for collections ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

## 3.1.0

### Minor Changes

- Migrate to changesets from changelogen ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

- Added minecraft styled tooltips ([#254](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/254))

### Patch Changes

- Changeset for PR #243 ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

- Use totalAmount instead of amount for collections ([#246](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/246))

## 3.1.0-beta.3

### Patch Changes

- Refactor how bots and embeds are handled to prevent getting flagged for "cloaking" ([`c4fab6e`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c4fab6ee92b10a4a136b1c87e9e350f15f9a757e))

- Enable link preloading again ([`8fa2660`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/8fa26605a08f45505122928ea5ea60a63374ecf0))

## 3.1.0-beta.2

### Minor Changes

- Added minecraft styled tooltips ([#252](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/pull/252))

## 3.1.0-beta.1

### Patch Changes

- [`d70e081`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/d70e0811a2e2ca368c67fa30650a688f1f8e0fde) Thanks [@DarthGigi](https://github.com/DarthGigi)! - Changeset for PR #243

- [`c039d0b`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/c039d0b2f24365f36be0c860d003b3fb2cda45b9) Thanks [@DarthGigi](https://github.com/DarthGigi)! - Use totalAmount instead of amount for collections

## 3.1.0-beta.0

### Minor Changes

- [`977ebff`](https://github.com/SkyCryptWebsite/SkyCrypt-Frontend/commit/977ebff4621e6734c2800677cd607da91ed75d8f) Thanks [@DarthGigi](https://github.com/DarthGigi)! - Migrate to changesets from changelogen

All notable changes to this project will be documented in this file.

The format is based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## v3.0.0

Initial release of the new GO rewrite of SkyCrypt-Backend.

## v2.0.0

Initial release of SkyCrypt v2 - A complete rewrite using SvelteKit.

## v1.0.0

Initial release

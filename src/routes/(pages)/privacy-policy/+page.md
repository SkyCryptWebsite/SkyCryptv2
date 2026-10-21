<script>
  import SvelteSeo from "svelte-seo";
</script>

<SvelteSeo
  title="Privacy Policy | SkyCrypt"
  description="What data SkyCrypt collects, why, how long we keep it, and how to get it removed."
  canonical="https://sky.shiiyu.moe/privacy-policy" />

# Privacy Policy

Last updated: 20 October 2026

This policy explains what data SkyCrypt collects when you use [sky.shiiyu.moe](https://sky.shiiyu.moe), why we collect it, who else receives it, and what you can do about it. You can use most of SkyCrypt without an account, and in that case we collect very little.

## Who we are

SkyCrypt is run by SkyCrypt LLC, a limited liability company registered in Maryland, United States (Department ID W27651397). Its principal office is at 306 W Redwood St, Ste 200, Baltimore, MD 21201, United States. The people who build and run SkyCrypt are based in the European Union, and our servers are in the EU. SkyCrypt LLC is the controller of the personal data described here.

To ask a question about your data or to use any of the rights below, email [privacy@shiiyu.moe](mailto:privacy@shiiyu.moe). You can also reach the team on our [Discord server](https://discord.gg/cNgADv2kEQ), but you never need a Discord account to contact us about privacy.

## Looking up players

SkyCrypt shows SkyBlock stats for any Minecraft player whose name someone searches. That data comes from the public Hypixel API and from Minecraft username lookups. It includes the player's username, UUID, profiles, skills, inventories and other SkyBlock progress that Hypixel makes available.

We keep a temporary copy of this data so pages load quickly. Profile data is kept for at most 24 hours, and most of it for 5 minutes. We do not build a history of a player's stats over time.

We cannot remove data from Hypixel. In SkyBlock you can turn off API access, and SkyCrypt will stop showing that data once our temporary copy expires.

## When you visit the site

When you load a page, our servers and Cloudflare, which sits in front of them, receive your IP address, your browser's user agent, and the page you asked for. We use this to deliver the page, to keep the site secure and to fix problems.

Our servers keep request logs with IP addresses for at most 7 days. Separate error and activity logs record the page, your browser type and your approximate location (country, and region or city where Cloudflare provides it), but not your IP address. If you are signed in, these logs also record your account ID, display name and role.

If something breaks in your browser, the page sends us the error message so we can fix it.

### Analytics

We use [Umami](https://umami.is) to count visits. It records the page you viewed, the site that sent you, your browser, operating system, device type, screen size, language and country. Umami does not set cookies and does not track you across other websites. We run it on our own server, so this data is not shared with anyone else.

On a sample of visits, Umami also records where on the page people click and how far they scroll, so we can see which parts of a page get used. We do not record sessions or what you type.

### Storage in your browser

SkyCrypt saves some of your choices in your browser so the site remembers them. This data stays on your device and is not sent to us. It includes your favorite players, recent searches, settings, themes, enabled resource packs, light or dark mode, which newsroom posts and banners you have already seen or dismissed, and which tabs you had open.

If you sign in, we set a cookie that keeps you signed in. We also set a cookie for your enabled resource packs and one that remembers whether a sidebar is open. We use no advertising or tracking cookies.

### Content loaded from other sites

Some images and features load directly from other services, which then receive your IP address:

- Player skins and heads come from nmsr.nickac.dev, and the 3D skin viewer looks up skins through mowojang.seraph.si.
- Discord avatars load from Discord's image servers.
- Newsroom images and videos load from media.shiiyu.moe, which is stored on Cloudflare.
- A newsroom post can embed a video or audio player from YouTube, Vimeo, Streamable or Spotify. That service only receives your data on posts that contain such an embed.

## When you sign in

You sign in to SkyCrypt with Discord. Signing in creates a SkyCrypt account, which you need for the dashboard, Patreon perks and the developer API.

### From Discord

We ask Discord only for your basic profile. We store your Discord user ID, username and display name, and the images and badges on your profile: avatar, banner, avatar decoration and server tag. We do not receive your email address or your messages. We create a placeholder email address that contains your Discord ID, because our sign-in system requires one.

### Minecraft accounts

If you connect [MC-ID](https://mc-id.com), we store the UUID and username of each Minecraft account you have linked there, and which one is your main account. Your main Minecraft account is shown next to anything you publish on SkyCrypt, such as newsroom posts. Hovering over or tapping it shows your Discord display name, username and avatar.

### Patreon

If you connect Patreon to unlock supporter perks, we store your Patreon user ID, your membership status for the SkyCrypt campaign, how much you have pledged in total and your current pledge level. Patreon handles all payments; we never see your card or bank details. We do not store your Patreon email address.

The profile emoji you unlock with Patreon is shown publicly next to your Minecraft account on its stats page.

### Sign-in tokens and sessions

To keep these connections working, we store the access tokens Discord, MC-ID and Patreon give us. For each device you are signed in on, we store a session with its IP address and browser user agent. You can see and end your sessions in Dashboard, Settings. A session ends 7 days after you last used it.

### Bot protection

The sign-in page and the API access form use Cloudflare Turnstile to block bots. Turnstile receives your IP address and information about your browser.

### Developer API

If you request API access, we store your project name, use case, website and description, the date you accepted the API rules, and any note our staff add when reviewing it. Once a key is issued, we store a hashed version of it, which cannot be turned back into the key, and its first few characters so you can recognize it. We also store its rate limit, how often it has been used and when it was last used.

### Moderation

SkyCrypt staff can see your account details to review requests and handle abuse. If staff ban you, we store the reason and when the ban ends. Every staff action is recorded in an internal log, which names the staff member and the account affected.

To stop banned users from coming back on a new account, we compare the Minecraft accounts you link through MC-ID with the Minecraft accounts of banned users. If one matches, your account is banned automatically for as long as the original ban lasts, and the match is recorded in the staff log. Staff can review and lift these bans. A banned account keeps its Discord and Minecraft links while the ban lasts, so it can't be deleted and recreated with the same accounts.

## Why we use your data

We use your data for these reasons, which are our legal bases under the GDPR:

- To provide what you asked for, such as your account, linked accounts, Patreon perks and API keys. This is necessary to provide the service you signed up for.
- To keep SkyCrypt secure and working, to stop abuse and to fix errors. This is our legitimate interest in running a safe and reliable site.
- To understand how the site is used, through Umami. This is our legitimate interest in improving SkyCrypt, and we chose a tool that does not track you across sites.
- To show public SkyBlock stats from the Hypixel API. This is our legitimate interest in providing a stats viewer, using data players have made public through Hypixel.

We do not sell your data and we do not use it for advertising.

## Who else receives your data

We use these services to run SkyCrypt. Each one only receives the data it needs for its part:

- Hetzner hosts our servers and databases in the EU.
- Cloudflare protects and speeds up the site, runs Turnstile, and stores newsroom images and our database backups.
- Hypixel and Minecraft username services receive the names and UUIDs of players people look up, but no information about you.

Discord, MC-ID and Patreon are separate services that you choose to sign in with or connect. They send us the data described above, and they handle your data under their own privacy policies.

Cloudflare is based in the United States. Our agreement with Cloudflare covers data it handles for us, and Cloudflare is certified under the EU-US Data Privacy Framework, which lets EU data be transferred to it. If that certification stops being valid, the European Commission's Standard Contractual Clauses apply instead.

## How long we keep your data

- Your account and everything connected to it stays until you delete your account.
- Sessions end 7 days after you last used them.
- Request logs with IP addresses are deleted after 7 days.
- Error and activity logs are deleted after 30 days.
- Player data from Hypixel is kept for at most 24 hours.
- We back up our database once a day and keep the 10 most recent backups, so each backup is deleted after about 10 days.
- The staff action log is kept after you delete your account so we can deal with abuse, but it is no longer linked to your account.

## Your rights

You can download a copy of your data, including your linked accounts and sessions, in Dashboard, Settings. You can delete your account there too. Deleting it removes your account, your linked accounts, sessions, API keys, API requests and profile emojis right away. It can take up to 10 days before your data is also gone from our backups.

Under the GDPR you also have the right to correct your data, to restrict or object to how we use it, and to receive it in a portable format. To use any of these rights, email us at [privacy@shiiyu.moe](mailto:privacy@shiiyu.moe). We answer within one month.

If you are unhappy with how we handle your data, you can complain to your local data protection authority.

## Children

You need to be at least 13 years old to create a SkyCrypt account, which is also Discord's minimum age. Anyone can look up SkyBlock stats without an account. If you believe a child under 13 has created an account, email us and we will delete it.

## Changes to this policy

We will update this policy when SkyCrypt changes how it handles data. If a change affects you in a significant way, we will announce it in the [newsroom](/newsroom) before it takes effect. The date at the top shows when this policy last changed.

<script>
  import SvelteSeo from "svelte-seo";
</script>

<SvelteSeo
  title="API Policy | SkyCrypt"
  description="The rules for building on the SkyCrypt API."
  canonical="https://sky.shiiyu.moe/api-policy" />

# API Policy

Last updated: 20 October 2026

This policy covers everything you build with a SkyCrypt API key. It applies on top of our [Terms of Service](/terms-of-service). If you break it, we can revoke your key and ban your account, and we don't have to warn you first.

SkyCrypt gets its data from Hypixel and follows the [Hypixel API Policy](https://developer.hypixel.net/policies). Anything built on the SkyCrypt API has to follow it too.

## What the API is for

The SkyCrypt API is for small, free hobby projects that look up a player when someone asks for that player, such as a Discord bot command, a mod that shows a player's stats, or a website where you search for a name.

If you need fresh data, more requests or a commercial project, apply for your own key in the [Hypixel Developer Dashboard](https://developer.hypixel.net) and use the Hypixel API directly.

It is not for collecting data in bulk. You may not:

- crawl or scrape players, profiles or the SkyCrypt website, including through the API;
- look up lists of players you collected elsewhere, such as guild members, leaderboards or lobby players, to build a database;
- check players over and over to watch for items, such as exotic armor, or to track their stats or networth over time;
- build anything that follows specific players or helps someone find them, or that reveals who is behind a nicked player;
- store our data and share or publish it as a dataset.

## Hypixel's rules

Your project must not:

- break the [Hypixel Rules](https://hypixel.net/rules) or help players break them;
- give players an unfair advantage in game;
- get around the Hypixel API Policy, for example by using SkyCrypt to get data you couldn't get from Hypixel under its rate limits;
- include betting or gambling;
- break the law.

## Credit SkyCrypt

Wherever your project shows data from the SkyCrypt API, say that it comes from SkyCrypt, for example "Data from SkyCrypt". On a website or in an app, link it to [sky.shiiyu.moe](https://sky.shiiyu.moe).

Your project must also say clearly that it is not affiliated with or endorsed by Hypixel or SkyCrypt, and must not use the Hypixel or SkyCrypt name or logo in a way that suggests otherwise.

## Your key

- Use one key per project. To build something new, request a new key.
- Keep your key private. Don't share it, put it in a mod or app that other people download, or commit it to public code. Call the API from your own server.
- Stay within your key's rate limit. You can request a higher limit in your dashboard.
- Don't use extra keys or accounts to get around a rate limit.

If your key leaks, delete it in your dashboard and request a new one.

## Cached data only

The API only returns data SkyCrypt already has, from players someone recently looked up on SkyCrypt. It never asks Hypixel for new data on your behalf. If we don't have a player, you get no data for them, and the data you do get can be older than what the website shows.

Cache our responses and reuse them, instead of asking for the same player again and again.

## No money

You may not make money from anything that uses the SkyCrypt API. That means no ads, subscriptions, paid features or selling data, and no selling access to the API. You can ask for donations, as long as everything in your project stays free for everyone. Your project may also not compete with SkyCrypt, for example by copying SkyCrypt's stats pages.

If you want to make money from your project, use the Hypixel API directly and follow the [Hypixel API Policy](https://developer.hypixel.net/policies), which requires a Production application for that.

## Abuse

Don't use the API to attack SkyCrypt or anyone else, to overload our servers, or to look for weaknesses without permission. To report a security issue, contact us on [Discord](https://discord.gg/cNgADv2kEQ).

## Changes to this policy

We will update this policy when the API or the Hypixel API Policy changes. If a change affects your project, we will announce it in the [newsroom](/newsroom). If you keep using your key after that, the new policy applies.

## Contact

Questions about this policy can go to [privacy@shiiyu.moe](mailto:privacy@shiiyu.moe) or our [Discord server](https://discord.gg/cNgADv2kEQ).

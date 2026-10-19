<script>
  import SvelteSeo from "svelte-seo";
</script>

<SvelteSeo
  title="API Policy | SkyCrypt"
  description="The rules for building on the SkyCrypt API."
  canonical="https://sky.shiiyu.moe/api-policy" />

# API Policy

Last updated: 19 October 2026

This policy covers everything you build with a SkyCrypt API key. It applies on top of our [Terms of Service](/terms-of-service). If you break it, we can revoke your key and ban your account, and we don't have to warn you first.

SkyCrypt gets its data from Hypixel and follows the [Hypixel API Policy](https://developer.hypixel.net/policies). Anything built on the SkyCrypt API has to follow it too.

## What the API is for

The SkyCrypt API is for projects that look up a player when someone asks for that player, such as a Discord bot command, a mod that shows a player's stats, or a website where you search for a name.

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

## Caching

Cache our responses and reuse them, instead of asking for the same player again and again. Stats on SkyCrypt only change every few minutes, so requesting the same player more often than that doesn't get you newer data.

## Making money

You can earn money from your project with ads, donations or subscriptions, as long as:

- everyone can use a free version of it, which can show ads;
- anything behind a paywall adds something of its own, such as new tools or insights, instead of just showing SkyCrypt data;
- it doesn't compete with SkyCrypt, for example by copying SkyCrypt's stats pages;
- it is fair to players and doesn't push them to spend money.

You may not sell SkyCrypt data itself, sell access to the SkyCrypt API, or offer your project as a replacement for the SkyCrypt or Hypixel API.

Hypixel also has rules for projects that make money, such as needing a Production application. If your project uses the Hypixel API directly, check the [Hypixel API Policy](https://developer.hypixel.net/policies) as well.

## Abuse

Don't use the API to attack SkyCrypt or anyone else, to overload our servers, or to look for weaknesses without permission. To report a security issue, contact us on [Discord](https://discord.gg/cNgADv2kEQ).

## Changes to this policy

We will update this policy when the API or the Hypixel API Policy changes. If a change affects your project, we will announce it in the [newsroom](/newsroom). If you keep using your key after that, the new policy applies.

## Contact

Questions about this policy can go to [privacy@shiiyu.moe](mailto:privacy@shiiyu.moe) or our [Discord server](https://discord.gg/cNgADv2kEQ).

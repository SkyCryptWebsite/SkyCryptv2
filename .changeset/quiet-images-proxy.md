---
"skycrypt-frontend": patch
---

Harden the theme image proxy against requests to internal addresses, including via DNS and redirects, and cap image size while streaming. Load the card builder only when it is opened, and drop unpublished posts from the sitemap without a restart.

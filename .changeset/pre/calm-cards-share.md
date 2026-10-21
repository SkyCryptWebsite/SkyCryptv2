---
"skycrypt-frontend": patch
---

Speed up stats pages and cards: the profile and embed load in parallel, card renders skip the username lookup and are capped under bursts, and banners and latest posts are shared across open pages instead of queried per visitor.

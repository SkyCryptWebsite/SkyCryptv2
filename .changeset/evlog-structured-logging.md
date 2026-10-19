---
"skycrypt-frontend": minor
---

Add structured logging with evlog: one wide event per request (with the signed-in user), readable text output in the container logs, and optional shipping to Grafana Loki via `LOKI_ENDPOINT`. Server `console.*` calls now use evlog.

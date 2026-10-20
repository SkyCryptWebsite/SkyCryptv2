---
"skycrypt-frontend": patch
---

Make stats pages much lighter: the icon font drops from 2 MB to 69 KB, the enchanted glint is a 31 KB animated AVIF instead of a 730 KB GIF, and the 3D skin viewer, settings panes, theme editor and card builder load only when used. Signed-in requests no longer run extra database queries for the session, and card renders queue under load instead of failing.

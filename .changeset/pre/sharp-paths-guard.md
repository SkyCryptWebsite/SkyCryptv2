---
"skycrypt-frontend": patch
---

Stop player and profile names from reaching other backend routes: invalid names on stats pages now return 404, and backend request paths are escaped so `.` and `..` can no longer be normalized away. Client-side navigation between profiles no longer waits for the Discord embed data.

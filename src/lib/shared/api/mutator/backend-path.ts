import { error } from "@sveltejs/kit";

/**
 * Orval interpolates path params unescaped, and they come straight from route params and public remote-function input.
 * `new URL` would collapse `.`/`..` segments (`/api/embed/x/..` becomes `/api/embed/`) and treat `?`, `#` and `\` as
 * syntax, letting anyone reach other backend routes with our server token. Encode every segment and refuse dot or empty
 * ones.
 */
export function toBackendPath(path: string): string {
  const segments = path.split("/").slice(1);
  if (!path.startsWith("/") || segments.some((segment) => segment === "" || segment === "." || segment === "..")) {
    error(400, "Invalid player or profile");
  }
  return `/${segments.map(encodeURIComponent).join("/")}`;
}

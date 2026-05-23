import type { Route } from "../types";

export function parseRoute(): Route {
  const hash = window.location.hash.replace(/^#/, "");
  const match = hash.match(/^\/servers\/([^/]+)$/);
  if (match?.[1]) {
    return { name: "server-detail", serverId: decodeURIComponent(match[1]) };
  }

  return { name: "home" };
}

export function navigateToHome() {
  window.location.hash = "/";
}

export function navigateToServerDetail(serverId: string) {
  window.location.hash = `/servers/${encodeURIComponent(serverId)}`;
}

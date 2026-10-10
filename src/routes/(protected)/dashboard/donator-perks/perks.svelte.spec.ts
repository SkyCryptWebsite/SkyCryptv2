import { beforeEach, expect, it, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import Perks from "./+page.svelte";

const mocks = vi.hoisted(() => ({
  retryAt: null as Date | null,
  linked: true,
  route: { url: new URL("http://localhost/dashboard/donator-perks"), state: {} },
  replaceState: vi.fn(),
  linkSocial: vi.fn(),
  refresh: vi.fn(),
  verify: vi.fn()
}));
vi.mock("$app/state", () => ({ page: mocks.route }));
vi.mock("$app/navigation", () => ({ replaceState: mocks.replaceState }));
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  mocks.retryAt = null;
  mocks.linked = true;
  mocks.route.url = new URL("http://localhost/dashboard/donator-perks");
});
vi.mock("../dashboard.remote", () => ({
  getDashboard: () =>
    Object.assign(
      Promise.resolve({
        user: { id: "preview" },
        accounts: mocks.linked ? [{ providerId: "patreon" }] : [],
        membership: null,
        verificationRetryAt: mocks.retryAt
      }),
      { refresh: mocks.refresh }
    ),
  verifyMembership: Object.assign(mocks.verify, { pending: 0 })
}));
vi.mock("./perks.remote", () => ({
  getPerks: () => Object.assign(Promise.resolve([]), { refresh: vi.fn() }),
  updateEmoji: vi.fn()
}));
vi.mock("$lib/shared/auth-client", () => ({ authClient: { linkSocial: mocks.linkSocial } }));
vi.mock("svelte-sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

it("restores the server cooldown and enables verification when it expires", async () => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  mocks.retryAt = new Date(Date.now() + 2_000);
  const view = await render(Perks);
  try {
    await expect.element(page.getByRole("button", { name: "Check again in 2s" })).toBeDisabled();
    await vi.advanceTimersByTimeAsync(1_000);
    await expect.element(page.getByRole("button", { name: "Check again in 1s" })).toBeDisabled();
    await vi.advanceTimersByTimeAsync(1_000);
    await expect.element(page.getByRole("button", { name: "Check support", exact: true })).toBeEnabled();
    expect(mocks.verify).not.toHaveBeenCalled();
  } finally {
    await view.unmount();
    vi.useRealTimers();
  }
});

it("refreshes the cooldown after a failed verification attempt", async () => {
  mocks.retryAt = null;
  mocks.verify.mockRejectedValueOnce(new Error("Wait one minute before verifying Patreon again."));
  mocks.refresh.mockResolvedValue(undefined);
  const view = await render(Perks);
  try {
    await page.getByRole("button", { name: "Check support", exact: true }).click();
    await expect.poll(() => mocks.refresh.mock.calls.length).toBe(1);
  } finally {
    await view.unmount();
  }
});

it("shows only the link control when Patreon is not connected", async () => {
  mocks.linked = false;
  mocks.linkSocial.mockResolvedValue({});
  const view = await render(Perks);
  try {
    await expect.element(page.getByRole("button", { name: "Check support", exact: true })).not.toBeInTheDocument();
    await page.getByRole("button", { name: "Link Patreon", exact: true }).click();
    expect(mocks.linkSocial).toHaveBeenCalledWith({
      provider: "patreon",
      callbackURL: "/dashboard/donator-perks?linked=patreon",
      errorCallbackURL: "/dashboard/donator-perks"
    });
  } finally {
    await view.unmount();
  }
});

it("checks automatically once after a successful link and hides the link control", async () => {
  mocks.route.url = new URL("http://localhost/dashboard/donator-perks?linked=patreon");
  const view = await render(Perks);
  try {
    await expect.poll(() => mocks.verify.mock.calls.length).toBe(1);
    await expect.element(page.getByRole("button", { name: "Link Patreon", exact: true })).not.toBeInTheDocument();
    expect(mocks.replaceState).toHaveBeenCalledWith(new URL("http://localhost/dashboard/donator-perks"), {});
  } finally {
    await view.unmount();
  }
});

it("waits for the existing cooldown before automatically checking the linked account", async () => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  mocks.retryAt = new Date(Date.now() + 2_000);
  mocks.route.url = new URL("http://localhost/dashboard/donator-perks?linked=patreon");
  const view = await render(Perks);
  try {
    expect(mocks.verify).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(2_000);
    await expect.poll(() => mocks.verify.mock.calls.length).toBe(1);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(mocks.verify).toHaveBeenCalledOnce();
  } finally {
    await view.unmount();
    vi.useRealTimers();
  }
});

it("does not automatically check after a failed link", async () => {
  mocks.route.url = new URL("http://localhost/dashboard/donator-perks?linked=patreon&error=access_denied");
  const view = await render(Perks);
  try {
    await expect.element(page.getByRole("button", { name: "Check support", exact: true })).toBeVisible();
    expect(mocks.verify).not.toHaveBeenCalled();
  } finally {
    await view.unmount();
  }
});

it("restores the localStorage timer without server cooldown state", async () => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  localStorage.setItem("skycryptPatreonRetryTimes", JSON.stringify({ preview: Date.now() + 2_000 }));
  const view = await render(Perks);
  try {
    await expect.element(page.getByRole("button", { name: "Check again in 2s" })).toBeDisabled();
    await vi.advanceTimersByTimeAsync(2_000);
    await expect.element(page.getByRole("button", { name: "Check support", exact: true })).toBeEnabled();
  } finally {
    await view.unmount();
    vi.useRealTimers();
  }
});

it("saves verification cooldowns locally and ignores another user's timer", async () => {
  localStorage.setItem("skycryptPatreonRetryTimes", JSON.stringify({ anotherUser: Date.now() + 60_000 }));
  const view = await render(Perks);
  try {
    await page.getByRole("button", { name: "Check support", exact: true }).click();
    const saved = JSON.parse(localStorage.getItem("skycryptPatreonRetryTimes")!);
    expect(saved.preview).toBeGreaterThan(Date.now());
    expect(mocks.verify).toHaveBeenCalledOnce();
  } finally {
    await view.unmount();
  }
});

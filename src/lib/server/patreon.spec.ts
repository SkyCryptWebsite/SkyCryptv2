import { patreonCreatorToken, patreonMembership } from "$lib/server/db/schema";
import { describe, expect, it } from "vitest";
import {
  findPatreonMembership,
  getPatreonEntitlement,
  PatreonEntitlement,
  type PatreonCampaignMembersResponse
} from "./patreon-entitlements";

it("exports the Patreon schema independently of Better Auth generation", () => {
  expect(patreonMembership.entitlementLevel).toBeDefined();
  expect(patreonCreatorToken.refreshToken).toBeDefined();
});

describe("getPatreonEntitlement", () => {
  it.each([
    [0, PatreonEntitlement.None],
    [499, PatreonEntitlement.None],
    [500, PatreonEntitlement.ColoredHeart],
    [5999, PatreonEntitlement.ColoredHeart],
    [6000, PatreonEntitlement.AnyEmoji]
  ])("maps %i cents to entitlement %i", (cents, entitlement) => {
    expect(getPatreonEntitlement(cents)).toBe(entitlement);
  });

  it("supports configured thresholds", () => {
    expect(getPatreonEntitlement(200, 100, 200)).toBe(PatreonEntitlement.AnyEmoji);
  });
});

describe("findPatreonMembership", () => {
  it("matches the linked Patreon user in the configured campaign response", () => {
    const response = {
      data: [
        {
          id: "member-1",
          relationships: { user: { data: { id: "another-user" } } }
        },
        {
          id: "member-2",
          attributes: { campaign_lifetime_support_cents: 6000 },
          relationships: { user: { data: { id: "patreon-user" } } }
        }
      ]
    } satisfies PatreonCampaignMembersResponse;

    expect(findPatreonMembership(response, "patreon-user")?.id).toBe("member-2");
    expect(findPatreonMembership(response, "missing-user")).toBeUndefined();
  });
});

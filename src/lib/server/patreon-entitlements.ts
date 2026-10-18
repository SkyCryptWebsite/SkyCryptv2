export const PatreonEntitlement = {
  None: 0,
  ColoredHeart: 1,
  AnyEmoji: 2
} as const;

export type PatreonEntitlement = (typeof PatreonEntitlement)[keyof typeof PatreonEntitlement];

export type PatreonCampaignMember = {
  id: string;
  attributes?: {
    campaign_lifetime_support_cents?: number;
    currently_entitled_amount_cents?: number;
    patron_status?: string | null;
  };
  relationships?: {
    user?: { data?: { id?: string } };
  };
};

export type PatreonCampaignMembersResponse = {
  data: PatreonCampaignMember[];
  meta?: { pagination?: { cursors?: { next?: string | null } } };
};

export function getPatreonEntitlement(
  lifetimeSupportCents: number,
  coloredHeartCents = 500,
  anyEmojiCents = 6000
): PatreonEntitlement {
  if (lifetimeSupportCents >= anyEmojiCents) return PatreonEntitlement.AnyEmoji;
  if (lifetimeSupportCents >= coloredHeartCents) return PatreonEntitlement.ColoredHeart;
  return PatreonEntitlement.None;
}

export function findPatreonMembership(response: PatreonCampaignMembersResponse, patreonUserId: string) {
  return response.data.find((member) => member.relationships?.user?.data?.id === patreonUserId);
}

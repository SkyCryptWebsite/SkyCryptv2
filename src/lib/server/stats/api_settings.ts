import type { Member, MuseumRaw, Profile } from "$types/global";

export function getAPISettings(profile: Profile, userProfile: Member, museum: MuseumRaw | null) {
  return {
    skills: userProfile.player_data?.experience?.SKILL_FORAGING !== undefined,
    inventory: userProfile.inventory?.inv_contents !== undefined,
    personal_vault: userProfile.inventory?.personal_vault_contents !== undefined,
    collections: userProfile.collection !== undefined,
    banking: profile.banking?.balance !== undefined,
    museum: museum !== null
  };
}

import type { Items, Member, Profile } from "$types/global";
import { getPreDecodedNetworth } from "skyhelper-networth";
import { FAIRY_SOULS } from "../constants/constants";

export async function getMainStats(userProfile: Member, profile: Profile, items: Items) {
  const bank = profile.banking?.balance ?? 0;
  const networthOptions = {
    onlyNetworth: true,
    returnItemData: false,
    cache: true,
    v2Endpoint: true
  };

  const networthItems = {
    armor: items.armor?.armor ?? [],
    equipment: items.equipment?.equipment ?? [],
    wardrobe: items.wardrobe.flat() ?? [],
    inventory: items.inventory ?? [],
    enderchest: items.enderchest ?? [],
    accessories: items.talisman_bag ?? [],
    personal_vault: items.personal_vault ?? [],
    storage: items.backpack
      ? Object.values(items.backpack)
          .flat()
          .concat(
            Object.values(items.backpack)
              .flat()
              .map((item) => item.containsItems ?? [])
              .flat()
          )
          .flat()
      : [],
    fishing_bag: items.fishing_bag ?? [],
    potion_bag: items.potion_bag ?? [],
    museum: items.museumItems ?? []
  };

  const predecodedNetworth = await getPreDecodedNetworth(userProfile, networthItems, bank, networthOptions);
  items.museumItems = [];

  return {
    joined: userProfile.profile?.first_join ?? 0,
    cookieBuffActive: userProfile.profile?.cookie_buff_active ?? false,
    purse: userProfile.currencies?.coin_purse ?? 0,
    bank: profile.banking?.balance ?? 0,
    fairySouls: {
      found: userProfile.fairy_soul?.total_collected ?? 0,
      total: FAIRY_SOULS[profile.game_mode ?? "normal"] ?? 0
    },
    networth: predecodedNetworth
  };
}

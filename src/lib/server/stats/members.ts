import { getUsername } from "$lib/server/lib";
import type { Member } from "$types/global";

export async function getProfileMembers(members: Record<string, Member>) {
  const output = [] as { uuid: string; username: string; removed: boolean }[];
  for (const member in members) {
    output.push({
      uuid: member,
      username: await getUsername(member, { cache: true }),
      removed: members[member].coop_invitation?.confirmed === false || members[member].profile?.deletion_notice?.timestamp !== undefined
    });
  }

  return output;
}

import { prerender } from "$app/server";
import { log } from "evlog";
import { z } from "zod";
import type { ModelsPlayerResolve } from "#lib/shared/api/orval-generated";
import { resolveUsernameByUuid } from "#lib/shared/api/skycrypt-api.remote";
import { fetchSkinTextures } from "#lib/shared/skin";
import { Role } from "./enums";

export interface Contributor extends ModelsPlayerResolve {
  id: string;
  quote?: string;
  role?: Role;
}

const contributorIds = [
  { id: "dec987bbfa734d63bb9d566139232f81", quote: "btw i use arch", role: Role.MAINTAINER },
  {
    id: "91f57dfc7f5845c9a4920f6c16640038",
    quote: "A useless human being that delivers nothing to society",
    role: Role.MAINTAINER
  },
  { id: "b44d2d5272dc49c28185b2d6a158d80a", quote: "nyaaaa~ :3", role: Role.MAINTAINER },
  { id: "f5667ad6b4b3434ba58f2ed2396f62f2", quote: '"lazy dev" &nbsp (ﾉ´･ω･)ﾉ ﾐ ┸━┸', role: Role.MAINTAINER },
  { id: "20d6334b7f9541ebbf7f860205ebf846", quote: "bob", role: Role.MAINTAINER },
  { id: "aad581b2f90048a785a7573d31d7b862", quote: "ember armor no longer on top :((", role: Role.MAINTAINER },
  { id: "d705483c5157460dad39712e4d74dfe1", quote: "Last online: January 1st, 1970", role: Role.FACILITATOR },
  { id: "7d7b04b49c24433cacc60a3da66eba01", quote: "🍞Grandmaster of Unit Testing", role: Role.FACILITATOR },
  { id: "1915444928b64d8b8973df8044f8cdb7", quote: "lea plant", role: Role.CONTRIBUTOR },
  { id: "8a3fa60d87aa4240bcdc624b90632529", quote: "Nate: CSS Wizard", role: Role.CONTRIBUTOR },
  { id: "5435b597612f4554a3c651fd1c3ee96a", quote: "/visit dukioooo", role: Role.CONTRIBUTOR },
  { id: "b876ec32e396476ba1158438d83c67d4", quote: "Long live the Potato king!", role: Role.TECHNOBLADE }
];

export const getContributors = prerender(
  z.string(),
  async (version) => {
    const getUsernames = async (uuid: string): Promise<ModelsPlayerResolve> => {
      try {
        return await resolveUsernameByUuid({ uuid, version });
      } catch (error) {
        log.error({ action: "contributors.resolve_username", uuid, error });
        return {
          uuid: uuid,
          username: "???"
        };
      }
    };

    const contributors = async () => {
      const usernames = await Promise.all(contributorIds.map(({ id }) => getUsernames(id)));

      return contributorIds.map((contributor, index) => ({
        ...contributor,
        username: usernames[index].username
      })) satisfies Contributor[];
    };

    return contributors();
  },
  { dynamic: true, inputs: () => [__PRERENDER_VERSION__] }
);

export const getContributorSkins = prerender(
  z.string(),
  async () => {
    const skins = await Promise.all(
      contributorIds.map(async ({ id }) => {
        try {
          return (await fetchSkinTextures(id)).skinUrl;
        } catch (error) {
          log.error({ action: "contributors.resolve_skin", uuid: id, error });
          return null;
        }
      })
    );

    return skins.filter((skin) => skin !== null);
  },
  { dynamic: true, inputs: () => [__PRERENDER_VERSION__] }
);

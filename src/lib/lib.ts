import type { ProfilesResponse, Options, Profile } from '$types/global';
import { HYPIXEL_API_KEY } from '$env/static/private';
import { SkyCryptError } from './constants/error';
import { isUUID } from '$params/uuid';
import { REDIS } from '$db/redis';

export async function getProfiles(paramPlayer: string) {
	const uuid = await getUUID(paramPlayer);
	if (!uuid) {
		throw new SkyCryptError('Player not found');
	}

	const profiles = await fetchProfiles(uuid);
	const output = [];
	for (const profile of profiles) {
		output.push({
			profile_id: profile.profile_id,
			cute_name: profile.cute_name,
			game_mode: profile.game_mode ?? 'normal',
			selected: profile.selected
		});
	}

	return output;
}

export async function fetchProfiles(uuid: string, options: Options = { cacheOnly: false }): Promise<Profile[]> {
	if (!isUUID(uuid)) {
		uuid = await getUUID(uuid);
	}

	const cache = await REDIS.get(`PROFILES:${uuid}`);
	if (cache || options.cacheOnly) {
		return JSON.parse(cache);
	}

	const headers = { Accept: 'application/json', 'User-Agent': 'SkyCrypt', 'API-KEY': HYPIXEL_API_KEY };
	const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}`, {
		headers
	});

	const data: ProfilesResponse = await response.json();
	if (data.success === false) {
		throw new SkyCryptError(data?.cause ?? 'Request to Hypixel API failed. Please try again!');
	}

	const { profiles } = data;
	if (!profiles || profiles.length === 0) {
		throw new SkyCryptError('No profiles found');
	}

	// 5 minutes
	REDIS.SETEX(`PROFILES:${uuid}`, 60 * 5, JSON.stringify(profiles));

	return profiles;
}

export async function getUUID(paramPlayer: string, options: Options = { cacheOnly: false }) {
	if (isUUID(paramPlayer)) {
		return paramPlayer;
	}

	const uuid = REDIS.get(`UUID:${paramPlayer}`);
	if (uuid || options.cacheOnly) {
		return uuid;
	}

	const data = await resolveUsernameOrUUID(paramPlayer);
	if (data.id) {
		// 24 hours
		REDIS.SETEX(`UUID:${paramPlayer}`, 60 * 60 * 24, data.id);
		return data.id;
	}

	return null;
}

async function resolveUsernameOrUUID(paramPlayer: string) {
	if (isUUID(paramPlayer)) {
		return { uuid: paramPlayer };
	}

	const response = await fetch(`https://mowojang.matdoes.dev/users/profiles/minecraft/${paramPlayer}`);
	if (response.status === 204) {
		throw new SkyCryptError('Player not found');
	}

	const data = await response.json();
	if (data.errorMessage) {
		throw new SkyCryptError(data.errorMessage);
	}

	return data;
}

export async function getProfile(uuid: string, profileId: string) {
	const profiles = await fetchProfiles(uuid);

	const profile =
		profiles.find((p) => p.selected) ??
		profiles.find((p) => p.cute_name.toUpperCase() === profileId.toUpperCase() || p.profile_id === profileId);

	if (!profile) {
		throw new SkyCryptError('Profile not found');
	}

	profile.uuid = await getUUID(uuid);

	return profile;
}

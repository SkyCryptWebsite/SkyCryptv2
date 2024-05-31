import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getProfile } from '$lib/lib';

export const GET: RequestHandler = async ({ params }) => {
	const { paramPlayer, paramProfile } = params;

	const profile = await getProfile(paramPlayer, paramProfile);

	return json(profile);
};

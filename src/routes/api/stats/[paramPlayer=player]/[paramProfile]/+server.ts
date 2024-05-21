import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getProfile } from '$lib/lib';
import { getStats } from '$lib/stats';

export const GET: RequestHandler = async ({ params }) => {
	const timeNow = Date.now();
	const { paramPlayer, paramProfile } = params;

	const profile = await getProfile(paramPlayer, paramProfile);

	const stats = await getStats(profile);

	console.log('Time taken:', Date.now() - timeNow, 'ms');
	return json(stats);
};

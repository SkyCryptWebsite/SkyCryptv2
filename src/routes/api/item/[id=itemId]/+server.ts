import type { RequestHandler } from './$types';
import { renderItem } from '$lib/renderer';
import { error } from '@sveltejs/kit';

// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params }) => {
	const timeNow = Date.now();
	const { id } = params;

	try {
		const attachment = await renderItem(id, {});

		return new Response(attachment.image, { headers: { 'Content-Type': 'image/png' } });
	} catch (errorMsg) {
		console.log('ERROR:', errorMsg);
		throw error(500, 'Internal server error');
	}

	console.log('Time taken:', Date.now() - timeNow, 'ms');
};

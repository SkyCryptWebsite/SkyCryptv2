import { getTexture } from '$lib/custom_resources';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';

// import { renderItem } from '$lib/renderer';
// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params }) => {
	const timeNow = Date.now();
	const { id } = params;

	try {
		console.log(id);

		// const attachment = await renderItem(id, {});

		// return new Response(attachment.image);
		return new Response('Hello, World!');
	} catch (errorMsg) {
		throw error(500, 'Internal server error');
	}

	console.log('Time taken:', Date.now() - timeNow, 'ms');
};

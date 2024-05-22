import type { RequestHandler } from './$types';
import { renderItem } from '$lib/renderer';
import { error } from '@sveltejs/kit';

// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params }) => {
	const timeNow = Date.now();
	const { id } = params;

	try {
		console.log('ITEM:', id);

		const attachment = await renderItem(id, {});

		console.log('attachment', attachment);

		return new Response(attachment.image ?? attachment.path);
	} catch (errorMsg) {
		throw error(500, 'Internal server error');
	}

	console.log('Time taken:', Date.now() - timeNow, 'ms');
};

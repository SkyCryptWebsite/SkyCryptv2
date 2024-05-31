import type { RequestHandler } from './$types';
import { getHead } from '$lib/renderer';
import { error } from '@sveltejs/kit';

// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	try {
		const attachment = await getHead(id);

		return new Response(attachment, { headers: { 'Content-Type': 'image/png' } });
	} catch (errorMsg) {
		console.log('ERROR:', errorMsg);
		throw error(500, 'Internal server error');
	}
};

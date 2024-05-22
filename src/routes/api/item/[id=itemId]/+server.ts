import type { RequestHandler } from './$types';
import { renderItem } from '$lib/renderer';
import { error } from '@sveltejs/kit';
import sharp from 'sharp';

// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params }) => {
	const timeNow = Date.now();
	const { id } = params;

	try {
		const attachment = await renderItem(id, {});

		const upscaledImage = await sharp(attachment.image).resize(512, 512).toBuffer();

		return new Response(upscaledImage, { headers: { 'Content-Type': 'image/png' } });
	} catch (errorMsg) {
		console.log('ERROR:', errorMsg);
		throw error(500, 'Internal server error');
	}

	console.log('Time taken:', Date.now() - timeNow, 'ms');
};

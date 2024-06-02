import { createClient } from 'redis';
import { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } from '$env/static/private';

export const REDIS = createClient({
	url: `redis://default:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`
});

export async function startRedis() {
	if (REDIS.isReady || REDIS.isOpen) return;

	console.log('[REDIS] Starting redis...');
	return REDIS.connect();
}

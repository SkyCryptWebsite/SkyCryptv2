import { startMongo } from '$db/mongo';
import { startRedis } from '$db/redis';
import { init } from '$lib/custom_resources';
import { parseNEURepository } from '$lib/scripts/parseNEURepository';
import { updateNotEnoughUpdatesRepository } from '$lib/scripts/updateNEURepository';
import { getPrices } from 'skyhelper-networth';

init();

startMongo().then(() => {
	console.log('[MONGO] Mongo started!');
});

startRedis().then(() => {
	console.log('[REDIS] Redis started!');
});

updateNotEnoughUpdatesRepository().then(() => {
	parseNEURepository();
});

getPrices().then(() => {
	console.log('[NETWORTH] Prices sucessfully fetched!');
});

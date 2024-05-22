import { startMongo } from '$db/mongo';
import { startRedis } from '$db/redis';
import { init } from '$lib/custom_resources';

init();

startMongo().then(() => {
	console.log('Mongo started!');
});

startRedis().then(() => {
	console.log('Redis started!');
});

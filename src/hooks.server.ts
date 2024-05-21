import { startMongo } from '$db/mongo';
import { startRedis } from '$db/redis';

startMongo().then(() => {
	console.log('Mongo started!');
});

startRedis().then(() => {
	console.log('Redis started!');
});

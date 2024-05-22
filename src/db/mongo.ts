import { MONGO_DATABASE, MONGO_HOST, MONGO_PORT } from '$env/static/private';
import { updateItems } from './mongo/update-items';
import { MongoClient } from 'mongodb';

const client = new MongoClient(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`);

export function startMongo() {
	console.log('Starting mongo...');

	updateItems();

	return client.connect();
}

export default client.db();

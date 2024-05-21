import { MongoClient } from 'mongodb';
import { MONGO_DATABASE, MONGO_HOST, MONGO_PORT } from '$env/static/private';

const client = new MongoClient(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`);

export function startMongo() {
	console.log('Starting mongo...');
	return client.connect();
}

export default client.db();

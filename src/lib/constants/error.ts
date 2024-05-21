export class SkyCryptError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SkyCryptError';
	}
}

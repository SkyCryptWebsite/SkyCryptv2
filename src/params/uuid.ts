import type { ParamMatcher } from '@sveltejs/kit';

export const isUUID = ((param) => {
	return (
		(param.length === 32 && /^[a-fA-F0-9]+$/.test(param)) || (param.length === 36 && /^[a-fA-F0-9-]+$/.test(param))
	);
}) satisfies ParamMatcher;

export const match = isUUID;

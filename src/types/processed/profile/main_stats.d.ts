import type { NetworthResult } from 'skyhelper-networth';

export type MainStats = {
	joined: number;
	cookie_buff_active: boolean;
	purse: number;
	bank: number;
	fairy_souls: {
		found: number;
		total: number;
	};
	networth: NetworthResult;
};

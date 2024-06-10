import type { NetworthResult } from "skyhelper-networth";

export type MainStats = {
  joined: number;
  cookieBuffActive: boolean;
  purse: number;
  bank: number;
  fairySouls: {
    found: number;
    total: number;
  };
  networth: NetworthResult;
};

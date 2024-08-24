import type { Log } from "./Log.type";
import type { StoreNames } from "./Store.type";

export interface RuntimeConfig {
  node: { env: "prod" | "production" | "dev" | "development" };
  model: string;
  offset: {
    page: number;
    url: string;
  };
  limit: {
    page: number;
    timeout: number;
    inactivity: number;
  };
  logging: {
    maxCriticality: number;
    types: Log["type"][];
    categories: Log["category"][];
    isSimple: boolean;
  };
  mockUserPause: {
    duration: number;
    variationRange: [number, number];
  };
  successCompletionRate: number;
  fatalErrorDepth: number;
  storeContent: StoreNames[];
  endProcess: boolean;
}

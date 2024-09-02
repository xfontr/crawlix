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
    /**
     * @description Type of logs that are to be logged.
     */
    types: Log["type"][];
    /**
     * @description Categories that are to be logged.
     */
    categories: Log["category"][];
    /**
     * @description For the selected categories, the logs only show name and message.
     * The complete log is stored anyways.
     */
    isSimple: Log["category"][];
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

import type { Log } from "./Log.type";
import type { StoreNames } from "./Store.type";

export interface RuntimeConfig {
  node: { env: "prod" | "production" | "dev" | "development" };
  offset: {
    page: number;
    url: string;
  };
  limit: {
    page: number;
    timeout: number;
    inactivityTimeout: number;
  };
  logging: {
    actionsDepth: number;
    locationUpdate: boolean;
    maxCriticality: number;
    logErrors: boolean;
    typeFilter: Log["type"][];
    isSimple: boolean;
  };
  mockUserPause: {
    duration: number;
    variationRange: [number, number];
  };
  completionRateToSuccess: number;
  fatalErrorDepth: number;
  storeContent: StoreNames[];
  endProcessIfOver: boolean;
}

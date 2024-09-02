import type { Log } from "./Log.type";
import type { StoreNames } from "./Store.type";

export interface RuntimeConfig {
  node: { env: "prod" | "production" | "dev" | "development" };
  model: string;
  offset: {
    index: number;
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
  /**
   * @description If the process should be exited upon session end
   */
  endProcess: boolean;
  /**
   * @description Instructions on how the final output should look like
   */
  output: {
    /**
     * @description Selects the registries (actions, locations, etc.) that should end up in the final output
     */
    include: StoreNames[];
    /**
     * @description Reduces the amount of detail found in each registry
     */
    isSimple: StoreNames[];
    /**
     * @description If true, each item will show the meta data in a separate object (_meta).
     * When false, al information is stored at the same level
     */
    itemWithMetaLayer: boolean;
  };
}

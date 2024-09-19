import type { Log, StoreNames } from ".";

export interface RuntimeConfig {
  node: { env: "prod" | "production" | "dev" | "development" };
  model: string;
  offset: {
    index: number;
    page: number;
    url: string;
  };
  limit: {
    /**
     * @description Ends session when reaching the set page limit
     */
    page: number;
    /**
     * @description Ends session when reaching the item count limit
     */
    items: number;
    /**
     * @description The maximum time allowed to run before forcibly stopped
     */
    timeout: number;
    /**
     * @description The maximum time allowed to run without any activity
     */
    inactivity: number;
  };
  logging: {
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
  output: {
    /**
     * @description Selects the registries (actions, locations, etc.) that should end up in the final output
     */
    include: StoreNames[];
    /**
     * @description How is the output data structured.
     * @default "RELATIONAL"
     */
    schema: "MINIMAL" | "RELATIONAL";
    /**
     * @description If true, objects will be flattened (no nested objects, just enough to separate different registries)
     */
    flatten: boolean;
  };
}

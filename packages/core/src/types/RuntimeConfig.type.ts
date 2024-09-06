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
    page: number;
    timeout: number;
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
  /**
   * @description Instructions on how the final output should look like
   */
  output: {
    /**
     * @description Selects the registries (actions, locations, etc.) that should end up in the final output
     */
    include: StoreNames[];
    /**
     * @description How is the output data structured. Default: Relational database
     */
    schema: "MINIMAL" | undefined;
    /**
     * @description If true, objects will be flattened (no nested objects, just enough to separate different registries)
     */
    flatten: boolean;
  };
}

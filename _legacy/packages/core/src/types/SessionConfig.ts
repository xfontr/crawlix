import type ScraperSpeed from "./ScraperSpeed";
import type ScraperTool from "./ScraperTool";

interface SessionConfig {
  enabled?: boolean;
  offset: {
    /**
     * @description The URL the scraper starts with
     * @default SCRAPER_URL .env variable
     */
    url?: string;
    /**
     * @description Tracks the current page
     * @default 0;
     */
    page?: number;
  };
  /**
   * @description Maximum amount of items or pages to read. Can't exceed 5.000 items in any case.
   * If both pages and items are set, the scraper will read until it reaches the first limit, whichever
   * it is
   * @default 150 items
   */
  limit: {
    /**
     * @description Maximum amount of items to read. Can't exceed 2.000 items in any case.
     * @default 150 items
     */
    items?: number;
    /**
     * @description Maximum amount of pages to read. If set to 0, the limit is the default maximum of 400
     * @default 0
     */
    page?: number;
  };
  /**
   * @description Maximum session length in milliseconds. Can't exceed 50 minutes
   * @default 300.000 ms // 5 minutes
   */
  globalTimeout: number;
  /**
   * @description Maximum session "after all" session length in milliseconds. Can't exceed 25 minutes
   * @default 60.000 ms // 1 minute
   */
  afterAllTimeout: number;
  /**
   * @description Time (in ms) after which the individual request will be cancelled. Can't exceed 30 seconds
   * @default 1.500 ms
   */
  timeout: number;
  /**
   * @description The length, in ms, by which the duration of each action
   * will be multiplied (higher, slower everything will be). Can't exceed 10 seconds
   * @default 80 0ms
   */
  taskLength: number;
  /**
   * @description Generates a random number between 1 and this parameter. The task length will be
   * multiplied by this random number (with one random decimal, too)
   * @example speed * taskLength * taskLengthRandomMultiplier
   * 0.5 * 800 * 0.2
   * @default 0.3
   */
  taskLengthRandomMultiplier: ScraperSpeed;
  /**
   * @description Minimum amount of full items the scraper needs in order to consider the session
   * successful. An item is considered "not full" when one or more fields are missing due to an error.
   * Naturally empty fields will not be computed.
   *
   * @param < 1 If less than one, it will be computed relatively to the total amount of expected items.
   * If the result is a non-absolute number, it will be rounded to the ceil
   * @param > 1 If more than one, it will be computed as an absolute number
   *
   * @default 0.99
   */
  minimumItemsToSuccess: number;
  /**
   * @description If false, will not save the usage data
   * @default false
   */
  usageData: boolean;
  /**
   * @description If false, the app will break on start if any config is missing
   * @default true
   */
  allowDefaultConfigs: boolean;
  /**
   * @description Data required to send email notifications. If empty, will not try to send any email.
   */
  emailing:
    | {
        host?: string;
        port?: number;
        user?: string;
        password?: string;
        receiverEmail?: string;
      }
    | undefined;
  /**
   * @description Allows the consumer to disable the script configs maximum values.
   *
   * RECOMMENDED: Leave it as enabled (default), since it can prevent unexpected
   * behavior and/or performance issues
   * @default true
   */
  safeMode: boolean;
}

export type SessionConfigInit<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  ScraperTool: ScraperTool<T>;
} & Partial<SessionConfig>;

export default SessionConfig;

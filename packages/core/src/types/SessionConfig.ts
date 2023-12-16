interface SessionConfig {
  offset: {
    /**
     * @description The URL the scraper starts with
     * @default SCRAPER_URL .env variable
     */
    url?: string;
    /**
     * @description Won't have an actual impact on the script. Its purpose is to track the current page for
     * more accurate session logs
     * @default 0;
     */
    page?: number;
    /**
     * @description Unique identifier for the item that the scrape should start with
     */
    item?: string;
    /**
     * @description The scraper will read all the items at the selected initial URL and start posting from
     * the chosen item number
     *
     * If unset, will scrape every item. If the value set is too high, will also scrape every item
     *
     * @default 0
     */
    itemNumber?: number;
    /**
     * @description If set, the scraper will also grab the defined number of items before the offset item
     * Ideal if there are slight variations on each session
     * @default 0
     */
    errorMargin?: number;
  };
  /**
   * @description Maximum amount of items to read. Can't exceed 2.000 items
   * @default 150 items
   */
  limit: number;
  /**
   * @description Maximum session length in milliseconds. Can't exceed 50 minutes
   * @default 300.000 ms // 5 minutes
   */
  globalTimeout: number;
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
}

export default SessionConfig;

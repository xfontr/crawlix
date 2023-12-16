interface SessionConfig {
  offset: {
    url?: string;
    page?: number;
    /**
     * @description Unique identifier for the item that the scrape should start with
     */
    item?: string;
  };
  /**
   * @description Maximum amount of items to read
   */
  limit: number;
  /**
   * @description Maximum session length in milliseconds
   */
  globalTimeout: number;
  /**
   * @description Time (in ms) after which the request will be cancelled
   */
  timeout: number;
  /**
   * @description The length, in ms, by which the duration of each action
   * will be multiplied (higher, slower everything will be)
   */
  taskLength: number;
}

export default SessionConfig;

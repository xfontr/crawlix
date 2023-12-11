interface SessionConfig {
  offset: {
    page: number;
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
   * @example
   * { timeout: 3_000 } // 3 seconds
   */
  timeout: number;
}

export default SessionConfig;

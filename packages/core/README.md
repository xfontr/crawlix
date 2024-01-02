# Scraper

## Script design

The script is structured in three layers, each of on a higher abstraction level:

### Scraper

Limited set of tools based on nodemailer, and built on the utils provided by the lower level helper "Session". It also provides the "Session" utils, so this tool can actually be used to run the entire script without a real need to descend to lower layers.

Main utilities:

- Hooks to all the utils provided by the Session layer.
- scrapItems function to grab items in bulk from a HTML container.
- pageUp function to increase the page while also updating the store and handling any error.
- A main function container that allows total control over the script, and that is a must if you wish to use the "globalTimeout" variable.

### Session

Orchestrates the entire app. This means: performs the necessary updates to the store, when requested by the user; and handles any necessary side-effect.

For example, if the user requests to log an error, this layer will update the store with said error and send a console message.

Ideally, however, the user will not directly use the Session methods, but use the Scraper upper layer.

### SessionStore

Stores all the session data: items, errors, start and end dates, duration, and a long etc. It does not have any side effect. Expects other functions to update and handle this data.

Can be instantiated only once and it must not be used directly by the end user (excepting the "current" property, which allows a read-only access to all the store data).

### Services (Email, actions)

These services are handled by the Session and provided by the Session itself and the Scraper. Therefore, there is no real need to ever use them manually, and in fact it's strongly discouraged.

## Set up configuration variables

```ts
{
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
}
```

## Full session data content

```ts
{
  /**
   * @description Session's ID in UUID format
   */
  _id: string;
  /**
   * @description Session start date
   */
  startDate: Date;
  /**
   * @description Session end date
   */
  endDate: Date;
  /**
   * @description Session length in ms
   */
  duration: number;
  /**
   * @description Total amount of actions executed by the scraper
   */
  totalActions: number;
  /**
   * @description Total base time, in ms, consumed by the scraper actions, not including the timeouts
   * (totalActions * taskLength * speed)
   */
  totalActionsJointLength: number;
  /**
   * @description Current location of the script, meaning the page it's at and the item is scraping
   */
  location: {
    url?: string;
    page?: number;
  };
  /**
   * @description Counter of actually scraped items
   */
  totalItems: number;
  /**
   * @description Scraped items
   */
  items: Item[];
  /**
   * @description History of accessed URLs
   */
  history: string[];
  /**
   * @description History of registered errors, including critical and non-critical ones
   */
  errorLog: {
    /**
     * @description Date and time the error was caught at
     */
    date: Date;
    /**
     * @description Moment of the session where the error happened, counted in milliseconds
     */
    moment: number;
    /**
     * @description If critical, the app will break
     */
    isCritical: boolean;
    /**
     * @description Error object
     */
    error: CustomError;
    /**
     * @description Page and item where the error was found
     */
    location: {
      url?: string;
      page?: number;
      itemNumber: number
    };
    /**
     * @description The total count of actions at the moment of the error
     */
    actionNumber: number;
  }[];
  /**
   * @description Whether the session was abruptly ended before successfully finishing
   */
  success: boolean;
  /**
   * @description Number of items which data was not fulfilled as expected
   */
  incompleteItems: number;
  /**
   * @description All the logs printed in the console during the session
   */
  logs: `[${number}] ${string}`[];
}
```

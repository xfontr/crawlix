# Scraper

## Pre-requisites

### Install pnpm

Pnpm is required in order to properly install and run the app. If you have homebrew, you only need to run the following command and you'll be all set:

```bash
$ brew install pnpm
```

### Define the correct NODE_ENV environment

Depending on where you'll be using the script, you'll have to define the right NODE_ENV variable. This means: you'll need to create a .env file in the root directory and place a variable named as "NODE_ENV".

The possible values are:

- dev
- test
- prod

There is no need to manually set the "test" value for testing. We recommend to set "dev" for local environments and "prod" once the script is being used in production.

This NODE_ENV variable is a must for the correct functioning of the app.

### Set up configurations (optional, recommended)

The app defines a set of default configuration variables. With them, the script will run seamlessly without the need to actually do any set up. However, if you wish to customize the experience, take a look at the .env.example file to learn each possible .env option.

It is important to note that you can also customize every single configuration variable from the code itself. These hard-coded configs will be placed above the .env, in case you accidentally have two configs for the same value.

Example:

```ts
const session = Session({
  globalTimeout: 100,
  // Or any other variable
}).init();
```

See below at "Set up configuration variables" in order to learn all the available options.

### Set up a test email account (recommended for developers)

Use the Ethereal email free service to get the required account credentials. This is required to pass the Email service tests.

## Run

```bash
$ cd [project_root]
$ pnpm i
$ pnpm run dev
$ pnpm run test # Optional
```

*https://dev.to/toa_anakin/using-puppeteer-anonymously-with-tor-l9l*

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
   * @description If true, will store the session store even if it ended abruptly
   * @default true
   */
  saveSessionOnError: boolean;
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

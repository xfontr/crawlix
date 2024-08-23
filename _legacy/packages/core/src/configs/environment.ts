import type { Locale } from "../../../legacy-i18n/src/i18n.types";

const ENVIRONMENT = {
  nodeEnv: (process.env["NODE_ENV"] ?? "dev") as "test" | "dev" | "prod",
  locale: (process.env["SCRAPER_LOCALE"] ?? "GB-en") as Locale,
  baseUrl: process.env["SCRAPER_URL"],
  offsetPage: process.env["SCRAPER_OFFSET_PAGE"],
  limitItems: process.env["SCRAPER_LIMIT_ITEMS"],
  limitPage: process.env["SCRAPER_LIMIT_PAGE"],
  timeout: process.env["SCRAPER_TIMEOUT"],
  taskLength: process.env["SCRAPER_TASK_LENGTH"],
  taskLengthRandomMultiplier:
    process.env["SCRAPER_TASK_LENGTH_RANDOM_MULTIPLIER"],
  globalTimeout: process.env["SCRAPER_GLOBAL_TIMEOUT"],
  afterAllTimeout: process.env["SCRAPER_AFTER_ALL_TIMEOUT"],
  minimumItemsToSuccess: process.env["SCRAPER_MINIMUM_ITEMS_TO_SUCCESS"],
  usageData: process.env["SCRAPER_USAGE_DATA"],
  allowDefaultConfigs: process.env["SCRAPER_ALLOW_DEFAULT_CONFIGS"],
  safeMode: process.env["SCRAPER_SAFE_MODE"],
  email: {
    host: process.env["SCRAPER_EMAIL_HOST"],
    port: process.env["SCRAPER_EMAIL_PORT"],
    user: process.env["SCRAPER_EMAIL_USER"],
    password: process.env["SCRAPER_EMAIL_PASSWORD"],
    receiverEmail: process.env["SCRAPER_EMAIL_RECEIVER_EMAIL"],
  },
  /**
   * @description DEV only territory :)
   */
  test: {
    email: {
      host: process.env["SCRAPER_TEST_EMAIL_HOST"] ?? "",
      port: +(process.env["SCRAPER_TEST_EMAIL_PORT"] ?? 0),
      user: process.env["SCRAPER_TEST_EMAIL_USER"] ?? "",
      password: process.env["SCRAPER_TEST_EMAIL_PASSWORD"] ?? "",
      receiverEmail: process.env["SCRAPER_TEST_EMAIL_RECEIVER_EMAIL"] ?? "",
    },
  },
};

export default ENVIRONMENT;

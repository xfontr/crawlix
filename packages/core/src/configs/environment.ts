const ENVIRONMENT = {
  baseUrl: process.env["SCRAPER_URL"] ?? "",
  offsetPage: process.env["SCRAPER_OFFSET_PAGE"],
  limitItems: process.env["SCRAPER_LIMIT_ITEMS"],
  limitPage: process.env["SCRAPER_LIMIT_PAGE"],
  timeout: process.env["SCRAPER_TIMEOUT"],
  taskLength: process.env["SCRAPER_TASK_LENGTH"],
  globalTimeout: process.env["SCRAPER_GLOBAL_TIMEOUT"],
  minimumItemsToSuccess: process.env["SCRAPER_MINIMUM_ITEMS_TO_SUCCESS"],
  usageData: process.env["SCRAPER_USAGE_DATA"],
  allowDefaultConfigs: process.env["SCRAPER_ALLOW_DEFAULT_CONFIGS"],
  saveSessionOnError: process.env["SCRAPER_SAVE_ALWAYS"],
};

export default ENVIRONMENT;

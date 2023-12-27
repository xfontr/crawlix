const ENVIRONMENT = {
  baseUrl: process.env["SCRAPER_URL"] ?? "",
  offsetPage: process.env["SCRAPER_OFFSET_PAGE"] as unknown as number,
  limitItems: process.env["SCRAPER_LIMIT_ITEMS"] as unknown as number,
  limitPage: process.env["SCRAPER_LIMIT_PAGE"] as unknown as number,
  timeout: process.env["SCRAPER_TIMEOUT"] as unknown as number,
  taskLength: process.env["SCRAPER_TASK_LENGTH"] as unknown as number,
  globalTimeout: process.env["SCRAPER_GLOBAL_TIMEOUT"] as unknown as number,
  minimumItemsToSuccess: process.env[
    "SCRAPER_MINIMUM_ITEMS_TO_SUCCESS"
  ] as unknown as number,
  usageData: process.env["SCRAPER_USAGE_DATA"] as unknown as string,
  allowDefaultConfigs: process.env[
    "SCRAPER_ALLOW_DEFAULT_CONFIGS"
  ] as unknown as string,
};

export default ENVIRONMENT;

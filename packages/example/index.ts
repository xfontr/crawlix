import { app } from "@crawlix/core";
import main from "./src/main";
import { useScraper, useScraperConfigStore } from "@crawlix/puppeteer";
import type Item from "./src/types/Item";

void (async () => {
  const config = useScraperConfigStore();

  config.set<Item>({
    clickAndScrapItem: true,
    navigationTimeout: 10_000,
  });

  app.init({
    endProcess: true,
    model: "Template",
    limit: {
      page: 10,
      items: 100,
      timeout: 480_000,
      inactivity: config.current.public.navigationTimeout + 3_000,
    },
    logging: {
      isSimple: ["ACTION", "ERROR", "LOCATION", "SESSION", "USER_INPUT"],
      categories: ["USER_INPUT", "ACTION"],
    },
  });

  const { init: initScraper } = useScraper({
    abortImages: true,
  });

  await initScraper();
  await main();
})();

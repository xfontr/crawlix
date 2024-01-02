import { tryCatch } from "@personal/utils";
import { Page, launch } from "puppeteer";
import EventBus from "../utils/EventBus";
import t from "../i18n";

const Puppeteer = async (): Promise<Page | void> => {
  const [page, error] = await tryCatch<Page>(async () => {
    const browser = await launch({ headless: "new" });
    return await browser.newPage();
  });

  if (error) {
    EventBus.emit("SESSION:ERROR", error, {
      name: t("error_index.init"),
      publicMessage: t("scraper.puppeteer.error"),
      isCritical: true,
    });
    return;
  }

  return page;
};

export default Puppeteer;

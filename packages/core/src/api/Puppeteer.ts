/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { tryCatch } from "@personal/utils";
import EventBus from "../helpers/EventBus";
import t from "../i18n";

/**
 * @param puppeteer version 21.7.0
 * @returns Page
 * @example
 * import puppeteer, { Page } from "puppeteer";
 *
 * const page = await Puppeteer<Page>(puppeteer)
 */

const Puppeteer = async <T>(puppeteer: any): Promise<T> => {
  const [page, error] = await tryCatch<T>(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    return await browser.newPage();
  });

  if (error) {
    EventBus.emit("SESSION:ERROR", error, {
      name: t("error_index.init"),
      publicMessage: t("scraper.puppeteer.error"),
      isCritical: true,
    });
  }

  return page as T;
};

export default Puppeteer;

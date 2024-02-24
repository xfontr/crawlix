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
    const browser = await puppeteer.launch({
      headless: false,
      // args: [
      //   "--user-data-dir=/Users/xifre/Library/Application Support/Google/Chrome/",
      // ],
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      ignoreDefaultArgs: ["--enable-automation"],
    });
    const page = await browser.newPage();

    // TODO: Rotate user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    );

    // page.on("request", async (request: any) => {
    //   if (request.resourceType() === "image") {
    //     return await request.abort();
    //   }
    //   return await request.continue();
    // });

    return page;
  });

  if (error) {
    EventBus.emit("SESSION:ERROR", error, {
      name: t("error_index.init"),
      publicMessage: t("scraper.puppeteer.error"),
      isCritical: true,
    });
    console.log({ error });
  }

  return page as T;
};

export default Puppeteer;

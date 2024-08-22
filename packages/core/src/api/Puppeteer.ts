/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { tryCatch } from "@personal/utils";
import EventBus from "../helpers/EventBus";
import t from "../i18n";
import PuppeteerOptions from "../types/PuppeteerOptions";
import { readdir } from 'fs/promises'

export const imageRequestHandler = async (request: any) => {
  if (request.resourceType() === "image") return await request.abort();

  return await request.continue();
};

export const PUPPETEER_DEFAULT_OPTIONS: PuppeteerOptions = {
  abortImages: false,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  executablePath:
    "/usr/bin/chromium-browser.sh",
  ignoreDefaultArgs: ["--enable-automation"],
  headless: false,
};

/**
 * @param puppeteer version 21.7.0
 * @returns Page
 * @example
 * import puppeteer, { Page } from "puppeteer";
 *
 * const page = await Puppeteer<Page>(puppeteer)
 */

const Puppeteer = async <T>(
  puppeteer: any,
  options: PuppeteerOptions = PUPPETEER_DEFAULT_OPTIONS,
): Promise<T> => {
  const dir = await readdir('/usr/bin/')
  console.log(dir)
  const [page, error] = await tryCatch<T>(async () => {
    const browser = await puppeteer.launch({
      headless: options.headless,
      executablePath: options.executablePath,
      ignoreDefaultArgs: options.ignoreDefaultArgs,
    });
    console.log("1");
    const page = await browser.newPage();
    console.log("2");
    // TODO: Rotate user agent
    if (options.userAgent) await page.setUserAgent(options.userAgent);
    console.log("3");
    if (options.abortImages) page.on("request", imageRequestHandler);
    console.log("4");
    return page;
  });

  if (error) {
    console.log(error);
    EventBus.emit("SESSION:ERROR", error, {
      name: t("error_index.init"),
      publicMessage: t("scraper.puppeteer.error"),
      isCritical: true,
    });
  }

  return page as T;
};

export default Puppeteer;

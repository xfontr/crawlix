/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { tryCatch } from "@personal/utils";
import EventBus from "../helpers/EventBus";
import t from "../i18n";
import PuppeteerOptions from "../types/PuppeteerOptions";

export const imageRequestHandler = async (request: any) => {
  if (request.resourceType() === "image") return await request.abort();

  return await request.continue();
};

export const PUPPETEER_DEFAULT_OPTIONS: PuppeteerOptions = {
  abortImages: false,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
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
) => {
  const [page, error] = await tryCatch<any>(async () => {
    const browser = await puppeteer.launch({
      headless: options.headless,
      executablePath: options.executablePath,
      ignoreDefaultArgs: options.ignoreDefaultArgs,
    });

    const page = await browser.newPage();

    // TODO: Rotate user agent
    if (options.userAgent) await page.setUserAgent(options.userAgent);

    if (options.abortImages) page.on("request", imageRequestHandler);

    return page;
  });

  if (!page || error) {
    EventBus.emit("SESSION:ERROR", error, {
      name: t("error_index.init"),
      publicMessage: t("scraper.puppeteer.error"),
      isCritical: true,
    });
  }

  const moveMouse = async (
    beginning: [number, number],
    end?: [number, number],
    options?: {
      clickWhenDone?: boolean;
      randomSpeedMultiplier?: boolean;
      speed?: number;
    },
  ) => {
    const move = async (y: number, x: number) =>
      await page.mouse.move(x, y, {
        steps: options?.randomSpeedMultiplier
          ? (+Math.random().toFixed(1) + 1) * (options?.speed ?? 1)
          : options?.speed,
      });

    await move(beginning[0], beginning[1]);

    if (end) {
      await move(end[0], end[1]);
      if (options?.clickWhenDone) await page.mouse.click(end[0], end[1]);
      return;
    }

    if (options?.clickWhenDone)
      await page.mouse.click(beginning[0], beginning[1]);
  };

  return { page: page as T, moveMouse };
};

export default Puppeteer;

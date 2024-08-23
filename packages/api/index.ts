/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36";

interface PuppeteerOptions {
  abortImages?: boolean;
  rotateUserAgent?: boolean;
  headless?: false | "new";
  args?: string[] | undefined;
  executablePath?: string | undefined;
  ignoreDefaultArgs?: string[] | undefined;
}

const PUPPETEER_DEFAULT_OPTIONS: PuppeteerOptions = {
  abortImages: false,
  ignoreDefaultArgs: ["--enable-automation"],
  headless: false,
  rotateUserAgent: true,
};

const imageRequestHandler = async (request: any) => {
  if (request.resourceType() === "image") return await request.abort();

  return await request.continue();
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
  options = { ...options, ...PUPPETEER_DEFAULT_OPTIONS };

  let browser;
  let page;

  try {
    browser = await puppeteer.launch({
      headless: options.headless,
      executablePath: options.executablePath,
      ignoreDefaultArgs: options.ignoreDefaultArgs,
    });
  } catch (error) {
    (error as Error).name =
      "[PUPPETEER:INIT] Could not init the puppeteer browser";
    throw error;
  }

  try {
    page = await browser.newPage();
    if (!page) throw new Error("No page");
  } catch (error) {
    (error as Error).name = "[PUPPETEER:INIT] Could not create a new page";
    throw error;
  }

  if (options.rotateUserAgent) {
    const { default: userAgents } = await import("./userAgents.js");
    const index = Math.floor(Math.random() * userAgents.length);

    await page.setUserAgent(userAgents[index]!.ua);
  } else {
    await page.setUserAgent(DEFAULT_USER_AGENT);
  }

  if (options.abortImages) page.on("request", imageRequestHandler);

  page.setViewport({ width: 1920, height: 1080 });

  return { page: page as T };
};

export default Puppeteer;

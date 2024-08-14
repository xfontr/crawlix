/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

interface PuppeteerOptions {
  abortImages?: boolean;
  userAgent?: string | undefined;
  headless?: false | "new";
  args?: string[] | undefined;
  executablePath?: string | undefined;
  ignoreDefaultArgs?: string[] | undefined;
}

const PUPPETEER_DEFAULT_OPTIONS: PuppeteerOptions = {
  abortImages: false,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ignoreDefaultArgs: ["--enable-automation"],
  headless: false,
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

  const browser = await puppeteer.launch({
    headless: options.headless,
    executablePath: options.executablePath,
    ignoreDefaultArgs: options.ignoreDefaultArgs,
  });

  const page = await browser.newPage();

  if (!page) {
    throw new Error("[PUPPETEER:INIT] Could not find the page object");
  }

  // TODO: Rotate user agent
  if (options.userAgent) await page.setUserAgent(options.userAgent);

  if (options.abortImages) page.on("request", imageRequestHandler);

  page.setViewport({ width: 1920, height: 1080 });

  return { page: page as T };
};

export default Puppeteer;

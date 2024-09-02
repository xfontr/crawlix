/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import userAgents from "./userAgents";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Options } from "./types";
import { Page } from "puppeteer";

const PUPPETEER_DEFAULT_OPTIONS: Options = {
  abortImages: false,
  ignoreDefaultArgs: ["--enable-automation"],
  headless: false,
};

const imageRequestHandler = async (request: any, page: Page) => {
  page.setRequestInterception(true);

  if (request.resourceType() === "image") return await request.abort();

  return await request.continue();
};

const Puppeteer = async (baseOptions: Options) => {
  const finalOptions = {
    ...PUPPETEER_DEFAULT_OPTIONS,
    ...baseOptions,
  };

  const { abortImages, userAgent, ...options } = finalOptions;

  puppeteer.use(StealthPlugin());

  let browser;
  let page;

  try {
    browser = await puppeteer.launch(options);
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

  if (!userAgent) {
    const index = Math.floor(Math.random() * userAgents.length);
    await page.setUserAgent(userAgents[index]!.ua);
  }

  if (userAgent) await page.setUserAgent(userAgent);

  if (abortImages) page.on("request", (req) => imageRequestHandler(req, page));

  page.setViewport({ width: 2560, height: 1440 });

  return { page };
};

export default Puppeteer;

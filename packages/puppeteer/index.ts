/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import userAgents from "./userAgents";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Options } from "./types";

const PUPPETEER_DEFAULT_OPTIONS: Options = {
  abortImages: false,
  ignoreDefaultArgs: ["--enable-automation"],
  headless: false,
  rotateUserAgent: true,
};

const imageRequestHandler = async (request: any) => {
  if (request.resourceType() === "image") return await request.abort();

  return await request.continue();
};

const Puppeteer = async (baseOptions: Options) => {
  const finalOptions = {
    ...PUPPETEER_DEFAULT_OPTIONS,
    ...baseOptions,
  };

  const { abortImages, rotateUserAgent, ...options } = finalOptions;

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

  if (rotateUserAgent) {
    const index = Math.floor(Math.random() * userAgents.length);
    await page.setUserAgent(userAgents[index]!.ua);
  }

  if (abortImages) page.on("request", imageRequestHandler);

  page.setViewport({ width: 1920, height: 1080 });

  return { page };
};

export default Puppeteer;

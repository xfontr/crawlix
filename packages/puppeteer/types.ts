import { VanillaPuppeteer } from "puppeteer-extra";

type VanillaPuppeteerOptions = Parameters<VanillaPuppeteer["launch"]>[0];

export type Options = VanillaPuppeteerOptions & {
  abortImages?: boolean;
  userAgent?: string;
};

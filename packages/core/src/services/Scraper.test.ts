import { Page } from "puppeteer";
import { Session } from "../..";
import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import Scraper from "./Scraper";
import t from "../i18n";

const mockInfo = jest.fn();

jest.mock("pino", () => () => ({
  info: (...args: unknown[]) => mockInfo(...args),
  error: (...args: unknown[]) => args,
  warn: (...args: unknown[]) => args,
}));

const mockGoto = jest.fn().mockResolvedValue(true);
const mockPage = {
  goto: (...args: unknown[]) => mockGoto(...args),
  $$: () => new Promise((resolve) => resolve(true)),
  $eval: () => new Promise((resolve) => resolve(true)),
  click: () => new Promise((resolve) => resolve(true)),
  waitForNavigation: () => new Promise((resolve) => resolve(true)),
} as unknown as Page;

jest.mock("puppeteer", () => ({
  launch: () => ({
    newPage: async () => await new Promise((resolve) => resolve(mockPage)),
  }),
}));

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
});

const promiseFunction = async (timeout = 0): Promise<true> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);

    jest.advanceTimersByTime(timeout);
  });
};

describe("Given a Scraper.run function", () => {
  describe("When called with a callback that is longer than the global timeout", () => {
    test("Then it should cut the callback and return an 'ABRUPT_ENDING' text", async () => {
      const { run } = await Scraper(mockSessionConfig);

      const [result] = await run(() =>
        promiseFunction(mockSessionConfig.globalTimeout + 1),
      );

      expect(result).toBe("ABRUPT_ENDING");
    });
  });

  describe("When called with a callback that is shorter than the global timeout", () => {
    test("Then it should return the callback returned value", async () => {
      const { run } = await Scraper(mockSessionConfig);

      const [result] = await run(() =>
        promiseFunction(mockSessionConfig.globalTimeout - 1),
      );

      expect(result).toBe(true);
    });

    test("Then it should go to the default page and end the store", async () => {
      const $s = Session(mockSessionConfig).init();
      const expectedTools = ScraperTools($s, mockPage);
      $s.end();

      const { run } = await Scraper(mockSessionConfig);

      const [result] = await run(async (tools) => {
        await promiseFunction(0);
        return JSON.stringify(tools);
      });

      expect(mockGoto).toHaveBeenCalledWith(mockSessionConfig.offset.url);
      expect(result).toStrictEqual(JSON.stringify(expectedTools));
    });

    test("Then it should return an error if an unhandled exception occurs", async () => {
      const error = new Error("test");

      const { run } = await Scraper(mockSessionConfig);

      const [result, resultError] = await run(
        async () => new Promise((_, reject) => reject(error)),
      );

      expect(result).toBeUndefined();
      expect(resultError).toStrictEqual(resultError);
    });
  });

  describe("When called twice", () => {
    test("Then it should do nothing the second time and return undefined", async () => {
      const { run } = await Scraper(mockSessionConfig);

      await run(async () => {
        await promiseFunction(0);
        return "test";
      });

      const [result] = await run(async () => {
        await promiseFunction(0);
        return "test";
      });

      expect(mockGoto).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });
});

describe("Given a Scraper.afterAll function", () => {
  describe("When called with a callback that is shorter than the afterAll timeout", () => {
    test("Then it should send a message indicating the afterAll functions begun", async () => {
      const { run: cleanUpEnd, afterAll } = await Scraper(mockSessionConfig);

      const [result, error] = await afterAll(() =>
        promiseFunction(mockSessionConfig.afterAllTimeout - 1),
      );

      expect(result).toBe(true);
      expect(error).toBeUndefined();
      expect(mockInfo).toHaveBeenCalledWith(t("session_actions.after_all"));

      await cleanUpEnd(() => promiseFunction());
    });

    test("Then it should provide the callback access to several hooks", async () => {
      const $s = Session(mockSessionConfig).init();
      const $t = ScraperTools($s, mockPage);
      $s.end();

      const { run: cleanUpEnd, afterAll } = await Scraper(mockSessionConfig);

      const expectedToools = JSON.stringify({
        notify: $t.hooks.notify,
        saveAsJson: $t.hooks.saveAsJson,
        logMessage: $t.hooks.logMessage,
      });

      const [resultTools] = await afterAll(
        (tools) => new Promise((resolve) => resolve(JSON.stringify(tools))),
      );

      expect(resultTools).toStrictEqual(expectedToools);

      await cleanUpEnd(() => promiseFunction());
    });
  });

  describe("When called with a callback that is longer than the afterAll timeout", () => {
    test("Then it should cut the callback and return an 'ABRUPT_ENDING' text", async () => {
      const { run: cleanUpEnd, afterAll } = await Scraper(mockSessionConfig);

      const [result, error] = await afterAll(() =>
        promiseFunction(mockSessionConfig.afterAllTimeout + 1),
      );

      expect(result).toBe("ABRUPT_ENDING");
      expect(error).toBeUndefined();

      await cleanUpEnd(() => promiseFunction());
    });
  });
});

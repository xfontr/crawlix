import { Page } from "puppeteer";
import { ScraperTools, Session, useAction } from "../..";
import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import scraper from "./Scraper";
import t from "../i18n";
import { ABRUPT_ENDING_ERROR } from "../configs/session";
import setDefaultTools from "../utils/setDefaultTools";
import CreateError from "../utils/CreateError";

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

const Scraper = scraper(mockSessionConfig);

describe("Given a scraper function", () => {
  describe("When called with a faulty Scraper Tool", () => {
    test("Then it should return an empty run wrapper, an afterAll function and log an error", async () => {
      const error = new Error("test");
      const customError = CreateError(error, {
        name: t("error_index.init"),
        publicMessage: t("scraper.error.launch"),
      });

      const ScraperTool = async () => {
        await new Promise((_, reject) => reject(error));
        return {};
      };

      const Scraper = scraper({ ...mockSessionConfig, ScraperTool });

      const { run, afterAll } = await Scraper();

      const runResult = await run(() => promiseFunction(0));

      expect(runResult).toStrictEqual([undefined, error]);

      const [currentStore] = await afterAll(({ store }) => store());

      expect(currentStore?.errorLog[0]?.error.publicMessage).toBe(
        customError.publicMessage,
      );
      expect(currentStore?.errorLog[0]?.error.message).toBe(
        customError.message,
      );
      expect(currentStore?.errorLog[0]?.error.name).toBe(customError.name);
    });
  });

  describe("When called with an empty Scraper Tool", () => {
    test("Then it should return an empty run wrapper, an afterAll function and log an error", async () => {
      const customError = CreateError(new Error("test"), {
        name: t("error_index.init"),
        publicMessage: t("scraper.error.empty"),
      });

      const ScraperTool = async () => {
        return new Promise((resolve) => resolve(undefined));
      };

      const Scraper = scraper({
        ...mockSessionConfig,
        ScraperTool: ScraperTool as ScraperTools<Record<string, unknown>>,
      });

      const { run, afterAll } = await Scraper();

      const runResult = await run(() => promiseFunction(0));

      expect(runResult).toStrictEqual([undefined, undefined]);

      const [currentStore] = await afterAll(({ store }) => store());

      expect(currentStore?.errorLog[0]?.error.publicMessage).toBe(
        customError.publicMessage,
      );
      expect(currentStore?.errorLog[0]?.error.message).toBe(
        customError.publicMessage,
      );
      expect(currentStore?.errorLog[0]?.error.name).toBe(customError.name);
    });
  });

  describe("When called with a valid Scraper Tool", () => {
    test("Then it should provide all its tools at the run function", async () => {
      const ScraperTool: ScraperTools<{
        test: () => number;
      }> = async ($s) =>
        new Promise((resolve) =>
          resolve({
            test: () => $s.store().timeout,
          }),
        );

      const Scraper = scraper({
        ...mockSessionConfig,
        ScraperTool,
      });

      const { run } = await Scraper();

      const runResult = await run(({ test }) => test());

      expect(runResult).toStrictEqual([mockSessionConfig.timeout, undefined]);
    });
  });
});

describe("Given a Scraper.run function", () => {
  describe("When called with a callback that is longer than the global timeout", () => {
    test("Then it should cut the callback and return an 'ABRUPT_ENDING' text", async () => {
      const { run } = await Scraper();

      const [result] = await run(() =>
        promiseFunction(mockSessionConfig.globalTimeout + 1),
      );

      expect(result).toBe(ABRUPT_ENDING_ERROR);
    });
  });

  describe("When called with a callback that is shorter than the global timeout", () => {
    test("Then it should return the callback returned value and provide the right tools", async () => {
      const $s = Session(mockSessionConfig).init();
      const expectedTools = setDefaultTools(
        $s,
        useAction(mockSessionConfig.taskLength),
      );
      $s.end();

      const { run } = await scraper()();

      const [result] = await run(async () => {
        await promiseFunction(mockSessionConfig.globalTimeout - 1);
        return JSON.stringify(expectedTools);
      });

      expect(result).toStrictEqual(JSON.stringify(expectedTools));
    });

    test("Then it should return an error if an unhandled exception occurs", async () => {
      const error = new Error("test");

      const { run } = await Scraper();

      const [result, resultError] = await run(
        async () => new Promise((_, reject) => reject(error)),
      );

      expect(result).toBeUndefined();
      expect(resultError).toStrictEqual(resultError);
    });
  });

  describe("When called with a callback and having a Scraper tool with an init function", () => {
    test("Then it should call said init function", async () => {
      const mockInit = jest.fn().mockResolvedValue(undefined);
      const Scraper = scraper({
        ScraperTool: () => ({
          init: mockInit,
        }),
      });

      await (await Scraper()).run(() => promiseFunction(0));

      expect(mockInit).toHaveBeenCalled();
    });
  });

  describe("When called twice", () => {
    test("Then it should do nothing the second time and return undefined", async () => {
      const { run } = await Scraper();

      const sessionResult = "test";

      const [firstResult] = await run(async () => {
        await promiseFunction(0);
        return sessionResult;
      });

      const [secondResult] = await run(async () => {
        await promiseFunction(0);
        return sessionResult;
      });

      expect(firstResult).toBe("test");
      expect(secondResult).toBeUndefined();
    });
  });
});

describe("Given a Scraper.afterAll function", () => {
  describe("When called with a callback that is shorter than the afterAll timeout", () => {
    test("Then it should send a message indicating the afterAll functions begun", async () => {
      const { run: cleanUpEnd, afterAll } = await Scraper();

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
      const $t = setDefaultTools($s, useAction(mockSessionConfig.taskLength));
      $s.end();

      const { run: cleanUpEnd, afterAll } = await Scraper();

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
      const { run: cleanUpEnd, afterAll } = await Scraper();

      const [result, error] = await afterAll(() =>
        promiseFunction(mockSessionConfig.afterAllTimeout + 1),
      );

      expect(result).toBe(ABRUPT_ENDING_ERROR);
      expect(error).toBeUndefined();

      await cleanUpEnd(() => promiseFunction());
    });
  });
});

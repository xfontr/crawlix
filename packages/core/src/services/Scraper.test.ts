import { CustomError, ScraperTools, Session, useAction } from "../..";
import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import scraper from "./Scraper";
import t from "../i18n";
import setDefaultTools from "../utils/setDefaultTools";
import CreateError from "../utils/CreateError";
import mockPromiseFunction from "../test-utils/mockPromiseFunction";

const mockInfo = jest.fn();

jest.mock("pino", () => () => ({
  info: (...args: unknown[]) => mockInfo(...args),
  error: (...args: unknown[]) => args,
  warn: (...args: unknown[]) => args,
}));

jest.useFakeTimers();

beforeEach(() => {
  jest.clearAllMocks();
});

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

      const runResult = await run(() => mockPromiseFunction());

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

      const runResult = await run(() => mockPromiseFunction());

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
    test("Then it should cut the callback and return an error", async () => {
      const { run } = await Scraper();

      const [result, error] = await run(() =>
        mockPromiseFunction({ timeout: mockSessionConfig.globalTimeout + 1 }),
      );

      expect(result).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(error!.message).toBe(t("session.error.global_timeout"));
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
        await mockPromiseFunction({
          timeout: mockSessionConfig.globalTimeout - 1,
        });
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

      await (await Scraper()).run(() => mockPromiseFunction());

      expect(mockInit).toHaveBeenCalled();
    });
  });

  describe("When called twice", () => {
    test("Then it should do nothing the second time and return undefined", async () => {
      const { run } = await Scraper();

      const sessionResult = "test";

      const [firstResult] = await run(async () => {
        await mockPromiseFunction();
        return sessionResult;
      });

      const [secondResult] = await run(async () => {
        await mockPromiseFunction();
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
        mockPromiseFunction({ timeout: mockSessionConfig.afterAllTimeout - 1 }),
      );

      expect(result).toBe(true);
      expect(error).toBeUndefined();
      expect(mockInfo).toHaveBeenCalledWith(t("session_actions.after_all"));

      await cleanUpEnd(() => mockPromiseFunction());
    });

    test("Then it should provide the callback access to several hooks", async () => {
      const $s = Session(mockSessionConfig).init();
      const $t = setDefaultTools($s, useAction(mockSessionConfig.taskLength));
      $s.end();

      const { run: cleanUpEnd, afterAll } = await Scraper();

      const expectedTools = JSON.stringify({
        notify: $t.hooks.notify,
        saveAsJson: $t.hooks.saveAsJson,
        logMessage: $t.hooks.logMessage,
      });

      const [resultTools] = await afterAll(
        (tools) => new Promise((resolve) => resolve(JSON.stringify(tools))),
      );

      expect(resultTools).toStrictEqual(expectedTools);

      await cleanUpEnd(() => mockPromiseFunction());
    });
  });

  describe("When called with a callback that is longer than the afterAll timeout", () => {
    test("Then it should cut the callback and return an error", async () => {
      const { run: cleanUpEnd, afterAll } = await Scraper();

      const [result, error] = await afterAll(() =>
        mockPromiseFunction({ timeout: mockSessionConfig.afterAllTimeout + 1 }),
      );

      expect(result).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(error!.message).toBe(t("session.error.after_all_timeout"));

      await cleanUpEnd(() => mockPromiseFunction());
    });
  });
});

describe("Given a Scraper.runInLoop function", () => {
  const runInLoopScraper = scraper({
    ...mockSessionConfig,
    offset: {
      page: 0,
    },
    limit: {
      page: 3,
    },
  });

  const mockLoopLength = 3 - 0;

  describe("When called with a callback that is longer than the global timeout", () => {
    test("Then it should cut the callback and return an error", async () => {
      const { runInLoop } = await runInLoopScraper();

      const [result, error] = await runInLoop(
        async ({ hooks: { nextPage } }) => {
          await mockPromiseFunction({
            timeout: mockSessionConfig.globalTimeout + 1,
          });
          nextPage();
        },
      );

      expect(result).toBeUndefined();

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      expect(error!.message).toBe(t("session.error.global_timeout"));
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
      const expectedIndex = mockLoopLength - 1;

      const { runInLoop } = await runInLoopScraper();

      const [result] = await runInLoop(
        async ({ index, hooks: { nextPage } }) => {
          await mockPromiseFunction({
            timeout: (mockSessionConfig.globalTimeout - 1) / 3,
          });
          nextPage();
          return JSON.stringify({ ...expectedTools, index });
        },
      );

      expect((result as string[])[2]).toBe(
        JSON.stringify({ ...expectedTools, index: expectedIndex }),
      );
    });

    test("Then it should return an error if an unhandled exception occurs", async () => {
      const error = new Error("test");

      const { runInLoop } = await runInLoopScraper();

      const [result, resultError] = await runInLoop(
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
        limit: { page: 3 },
        ScraperTool: () => ({
          init: mockInit,
        }),
      });

      await (
        await Scraper()
      ).runInLoop(async ({ hooks: { nextPage } }) => {
        nextPage();
        await mockPromiseFunction();
      });

      /**
       * We make sure that it has been called only once, as we don't want it to run for each loop
       */
      expect(mockInit).toHaveBeenCalledTimes(1);
    });
  });

  describe("When called twice", () => {
    test("Then it should do nothing the second time and return undefined", async () => {
      const { runInLoop } = await runInLoopScraper();

      const sessionResult = "test";

      const [firstResult] = await runInLoop(async ({ hooks: { nextPage } }) => {
        await mockPromiseFunction();
        nextPage();
        return sessionResult;
      });

      const [secondResult] = await runInLoop(
        async ({ hooks: { nextPage } }) => {
          await mockPromiseFunction();
          nextPage();
          return sessionResult;
        },
      );

      expect(firstResult).toStrictEqual(
        Array(mockLoopLength).fill(sessionResult),
      );
      expect(secondResult).toBeUndefined();
    });
  });

  describe("When called with a safetyCheck of 2", () => {
    describe("If it doesn't advance page or items in two loops", () => {
      test("Then it should return and log an error", async () => {
        const expectedError = CreateError(
          Error(t("scraper.error.loop_stuck")),
          { name: t("error_index.session") },
        );

        const { runInLoop, afterAll } = await runInLoopScraper();
        const response = await runInLoop(() => mockPromiseFunction());

        const [receivedError] = await afterAll<CustomError>(
          ({ store }) => store().errorLog[0]!.error,
        );

        expect(response[1]!.message).toBe(expectedError.message);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        expect(receivedError!.publicMessage).toBe(receivedError!.publicMessage);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        expect(receivedError!.message).toBe(receivedError!.message);
      });
    });
  });

  describe("When called with no safetyCheck", () => {
    describe("If it doesn't advance page or items", () => {
      test("Then it should loop until timeout", async () => {
        const { runInLoop } = await runInLoopScraper();

        const [result, error] = await runInLoop(
          async ({ store }) =>
            await mockPromiseFunction({ timeout: store().globalTimeout / 4 }),
          0,
        );

        expect(result).toBeUndefined();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        expect(error!.message).toBe(t("session.error.global_timeout"));
      });
    });
  });
});

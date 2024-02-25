import CreateError from "../utils/CreateError";
import t from "../i18n";
import { infoMessage } from "../logger";
import { tryCatch } from "@personal/utils";
import type { SessionConfigInit } from "../types/SessionConfig";
import setDefaultTools from "../utils/setDefaultTools";
import Session from "../helpers/Session";
import type SessionData from "../types/SessionData";
import IScraperTool from "../types/ScraperTool";
import { useAction } from "../..";

export type AfterAllTools = {
  useConnectors: ReturnType<typeof Session>["hooks"]["useConnectors"];
  useLoggers: ReturnType<typeof Session>["hooks"]["useLoggers"];
} & {
  store: () => SessionData;
};

type Tools<S extends Record<string, unknown>> = ReturnType<IScraperTool<S>>;

const scraper =
  <S extends Record<string, unknown>>({
    ScraperTool,
    ...baseConfig
  }: Partial<SessionConfigInit<S>> = {}) =>
  async () => {
    if (baseConfig.enabled === false)
      return {
        run: () => [undefined, undefined],
        afterAll: () => [[undefined], undefined],
      };

    const session = Session(baseConfig).init();
    const actions = useAction(session.store().taskLength);
    const utils = session.hooks.useUtils();

    let tools = setDefaultTools(session, actions);

    const afterAll = async <R>(
      callback: (scraper: AfterAllTools) => Promise<R> | R,
    ) => {
      infoMessage(t("session_actions.after_all"));

      /**
       * This function is meant to run only after the main actual run. Therefore, the store has already been
       * ended and using the $$a function would cause this not to work (plus, it would be pointless)
       */
      const afterAllResult = await tryCatch<R>(() =>
        utils.setGlobalTimeout(async (cleanUp) => {
          const result = await callback({
            useLoggers: session.hooks.useLoggers,
            useConnectors: session.hooks.useConnectors,
            store: session.store,
          });

          cleanUp();
          return result;
        }, "afterAllTimeout"),
      );

      return afterAllResult;
    };

    if (ScraperTool) {
      const [customScraper, error] = await tryCatch<Awaited<Tools<S>>>(
        async () => await ScraperTool(tools),
      );

      if (error || !customScraper) {
        const customError = CreateError(
          error ?? Error(t("scraper.error.empty")),
          {
            name: t("error_index.init"),
            publicMessage: t(`scraper.error.${error ? "launch" : "empty"}`),
          },
        );

        utils.error(customError, { isCritical: true });

        return {
          run: () => [undefined, error ?? customError],
          afterAll,
        };
      }

      tools = { ...customScraper, ...tools };
    }

    const run = async <R>(
      callback: (scraper: Awaited<Tools<S>> & typeof tools) => Promise<R> | R,
    ) => {
      const runResult = await actions.$$a(() =>
        utils.setGlobalTimeout(async (cleanUp) => {
          ScraperTool &&
            (await (tools as Awaited<Tools<S>> & typeof tools).init?.());
          const result = await callback(
            tools as Awaited<Tools<S>> & typeof tools,
          );
          session.end(false);
          cleanUp();
          return result;
        }),
      );

      return runResult;
    };

    return {
      run,
      afterAll,
    };
  };

export default scraper;

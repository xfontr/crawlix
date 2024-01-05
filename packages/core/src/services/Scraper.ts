import { ScraperTools, Session, SessionData, useAction } from "../..";
import t from "../i18n";
import { infoMessage } from "../logger";
import SessionStore from "../helpers/SessionStore";
import { tryCatch } from "@personal/utils";
import type { SessionConfigInit } from "../types/SessionConfig";
import setDefaultTools from "../utils/setDefaultTools";

type AfterAllTools = Pick<ReturnType<typeof Session>, "notify"> &
  Pick<ReturnType<typeof Session>, "saveAsJson"> &
  Pick<ReturnType<typeof SessionStore>, "logMessage"> & {
    store: () => SessionData;
  };

type Tools<S extends Record<string, unknown>> = ReturnType<ScraperTools<S>>;

const scraper =
  <S extends Record<string, unknown>>({
    ScraperTool,
    ...baseConfig
  }: Partial<SessionConfigInit<S>> = {}) =>
  async () => {
    const session = Session(baseConfig).init();
    const actions = useAction(session.store().taskLength);
    let tools = setDefaultTools(session, actions);

    const afterAll = async <
      R,
      T extends (scraper: AfterAllTools) => Promise<R> | R,
    >(
      callback: T,
    ) => {
      infoMessage(t("session_actions.after_all"));

      /**
       * This function is meant to run only after the main actual run. Therefore, the store has already been
       * ended and using the $$a function would cause this not to work (plus, it would be pointless)
       */
      const afterAllResult = tryCatch<ReturnType<T>>(
        async () =>
          await session.setGlobalTimeout(async (cleanUp) => {
            const result = await callback({
              notify: session.notify,
              saveAsJson: session.saveAsJson,
              logMessage: session.storeHooks.logMessage,
              store: session.store,
            });

            cleanUp();
            return result;
          }, "afterAllTimeout"),
      );

      return afterAllResult;
    };

    if (ScraperTool) {
      const [customScraper, error] = await tryCatch<Awaited<Tools<S>>>(() =>
        ScraperTool(session, actions),
      );

      if (error || !customScraper) {
        session.error(error || Error(t("scraper.error.empty")), {
          name: t("error_index.init"),
          publicMessage: t(`scraper.error.${error ? "launch" : "empty"}`),
          isCritical: true,
        });

        return {
          run: () => [undefined, error],
          runInLoop: () => [],
          afterAll,
        };
      }

      tools = { ...customScraper, ...tools };
    }

    const run = async <
      R,
      T extends (scraper: Awaited<Tools<S>> & typeof tools) => Promise<R> | R,
    >(
      callback: T,
    ) => {
      const runResult = await actions.$$a(() =>
        session.setGlobalTimeout(async (cleanUp) => {
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

    const loopPromise = async <T>(
      callback: () => Promise<T> | T,
      breakingCondition: () => boolean,
    ) => {
      const results = [];

      do {
        results.push(await callback());
      } while (breakingCondition() === false);

      return results;
    };

    const breakingCondition =
      (store: () => SessionData<Record<string, string | number | object>>) =>
      () => {
        const {
          totalItems,
          limit,
          location: { page },
        } = store();

        return (
          totalItems >= limit.items! || !!(limit.page && page >= limit.page)
        );
      };

    const runInLoop = async <
      R,
      T extends (
        scraper: Awaited<Tools<S>> &
          typeof tools & {
            index: number;
          },
      ) => Promise<R> | R,
    >(
      callback: T,
    ) => {
      const runResult = await actions.$$a(() =>
        session.setGlobalTimeout(async (cleanUp) => {
          ScraperTool &&
            (await (tools as Awaited<Tools<S>> & typeof tools).init?.());

          let index = -1;

          const result = await loopPromise(() => {
            index += 1;
            return callback({ ...tools, index } as Awaited<Tools<S>> &
              typeof tools & {
                index: number;
              });
          }, breakingCondition(session.store));

          session.end(false);
          cleanUp();
          return result;
        }),
      );

      return runResult;
    };

    return {
      run,
      runInLoop,
      afterAll,
    };
  };

export default scraper;

import { ScraperTools, Session, SessionData, useAction } from "../..";
import CreateError from "../utils/CreateError";
import t from "../i18n";
import { infoMessage } from "../logger";
import SessionStore from "../helpers/SessionStore";
import { tryCatch } from "@personal/utils";
import type { SessionConfigInit } from "../types/SessionConfig";
import setDefaultTools from "../utils/setDefaultTools";
import promiseAllSeq from "../utils/sequentialPromises";
import EventBus from "../helpers/EventBus";

type AfterAllTools = Pick<ReturnType<typeof Session>, "notify"> &
  Pick<ReturnType<typeof Session>, "saveAsJson"> &
  Pick<ReturnType<typeof Session>, "saveItemsLocally"> &
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
    if (baseConfig.enabled === false)
      return {
        run: () => [undefined, undefined],
        runInLoop: () => [undefined, undefined],
        afterAll: () => [[undefined], undefined],
        beforeAll: () => [undefined, undefined],
      };

    const session = Session(baseConfig).init();
    const actions = useAction(session.store().taskLength);
    let tools = setDefaultTools(session, actions);

    // TODO: Test this
    const beforeAll = async <R>(
      callback: (
        scraper: Awaited<Tools<S>> &
          typeof tools & {
            storeGodMode: () => Partial<
              SessionData<Record<string, string | number | object>>
            >;
          },
      ) => Promise<R> | R,
    ) => {
      infoMessage(t("session_actions.before_all"));

      const runResult = await actions.$$a(
        () =>
          session.setGlobalTimeout(async (cleanUp) => {
            const result = await callback({
              ...(tools as Awaited<Tools<S>> & typeof tools),
              storeGodMode: session.storeGodMode,
            });

            cleanUp();
            return result;
          }, "afterAllTimeout"), // TODO: Have a global variable that covers both types of timeouts
      );

      return runResult;
    };

    const afterAll = async <R>(
      callback: (scraper: AfterAllTools) => Promise<R> | R,
    ) => {
      infoMessage(t("session_actions.after_all"));

      /**
       * This function is meant to run only after the main actual run. Therefore, the store has already been
       * ended and using the $$a function would cause this not to work (plus, it would be pointless)
       */
      const afterAllResult = tryCatch<R>(
        async () =>
          await session.setGlobalTimeout(async (cleanUp) => {
            const result = await callback({
              notify: session.notify,
              saveAsJson: session.saveAsJson,
              saveItemsLocally: session.saveItemsLocally,
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
        const customError = CreateError(
          error ?? Error(t("scraper.error.empty")),
          {
            name: t("error_index.init"),
            publicMessage: t(`scraper.error.${error ? "launch" : "empty"}`),
          },
        );

        session.error(customError, { isCritical: true });

        return {
          run: () => [undefined, error ?? customError],
          runInLoop: () => [undefined, error ?? customError],
          afterAll,
          beforeAll,
        };
      }

      tools = { ...customScraper, ...tools };
    }

    const run = async <R>(
      callback: (scraper: Awaited<Tools<S>> & typeof tools) => Promise<R> | R,
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

    const runInLoop = async <R>(
      callback: (
        scraper: Awaited<Tools<S>> &
          typeof tools & {
            index: number;
          },
      ) => Promise<R> | R,
      safetyCheck = 2,
    ) => {
      let isSessionOver = false;

      EventBus.on("SESSION:ACTIVE", (status: boolean) => {
        isSessionOver = !status;
      });

      return await actions.$$a(() =>
        session.setGlobalTimeout(async (cleanUp) => {
          ScraperTool &&
            (await (tools as Awaited<Tools<S>> & typeof tools).init?.());

          let index = -1;

          /** Will be updated only if there's a safetyCheck on */
          const history = {
            totalItems: 0,
            page: session.store().offset.page,
          };

          const result = await promiseAllSeq(() => {
            if (isSessionOver) return;

            index += 1;

            const {
              totalItems,
              location: { page },
            } = session.store();

            if (
              safetyCheck &&
              index % safetyCheck &&
              history.totalItems === totalItems &&
              history.page === page
            ) {
              throw CreateError(Error(t("scraper.error.loop_stuck")), {
                name: t("error_index.session"),
              });
            } else if (safetyCheck) {
              history.totalItems = totalItems;
              history.page = page;
            }

            return callback({ ...tools, index } as Awaited<Tools<S>> &
              typeof tools & {
                index: number;
              });
          }, session.storeHooks.hasReachedLimit);

          if (!isSessionOver) session.end(false);
          cleanUp();
          return result;
        }),
      );
    };

    return {
      run,
      runInLoop,
      afterAll,
      beforeAll,
    };
  };

export default scraper;

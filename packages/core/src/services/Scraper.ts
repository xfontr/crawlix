import { Session } from "../..";
import t from "../i18n";
import { infoMessage } from "../logger";
import SessionStore from "../helpers/SessionStore";
import { tryCatch } from "@personal/utils";
import type { SessionConfigInit } from "../types/SessionConfig";

type AfterAllTools = Pick<ReturnType<typeof Session>, "notify"> &
  Pick<ReturnType<typeof Session>, "saveAsJson"> &
  Pick<ReturnType<typeof SessionStore>, "logMessage">;

const scraper = <S extends Record<string, unknown>>({
  ScraperTool,
  ...baseConfig
}: SessionConfigInit<S>) => {
  const session = Session(baseConfig).init();

  return async () => {
    const $t = await ScraperTool(session);

    // SESSION WRAPPERS
    const run = async <R, T extends (scraper: typeof $t) => Promise<R>>(
      callback: T,
    ) => {
      const runResult = await $t.hooks.$$a(() =>
        session.setGlobalTimeout(async (cleanUp) => {
          await $t.init?.();
          const result = await callback($t);
          $t.abort(false);
          cleanUp();
          return result;
        }),
      );

      return runResult;
    };

    const afterAll = async <
      R,
      T extends (scraper: AfterAllTools) => Promise<R>,
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
              notify: $t.hooks.notify,
              saveAsJson: $t.hooks.saveAsJson,
              logMessage: $t.hooks.logMessage,
            });

            cleanUp();
            return result;
          }, "afterAllTimeout"),
      );

      return afterAllResult;
    };

    return {
      run,
      afterAll,
    };
  };
};

export default scraper;

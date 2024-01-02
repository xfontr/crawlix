import { type DefaultItem, Session, type SessionConfig } from "../..";
import t from "../i18n";
import { infoMessage } from "../logger";
import Puppeteer from "../helpers/Puppeteer";
import ScraperTools from "./ScraperTools";
import SessionStore from "../helpers/SessionStore";

type AfterAllTools = Pick<ReturnType<typeof Session>, "notify"> &
  Pick<ReturnType<typeof Session>, "saveAsJson"> &
  Pick<ReturnType<typeof SessionStore>, "logMessage">;

const Scraper = async (
  baseConfig: Partial<SessionConfig>,
  itemData?: Partial<Record<keyof DefaultItem, string>>,
) => {
  // INIT - The order of the following tasks is important
  const $s = Session(baseConfig).init();

  const page = await Puppeteer();

  const $t = ScraperTools($s, page, itemData);

  // SESSION WRAPPERS
  const run = async <R, T extends (scraper: typeof $t) => Promise<R>>(
    callback: T,
  ) => {
    const runResult = await $t.hooks.$$a(() =>
      $s.setGlobalTimeout(async (cleanUp) => {
        await $t.goToPage();
        const result = await callback($t);
        $s.end(false);
        cleanUp();
        return result;
      }),
    );

    return runResult;
  };

  const afterAll = async <R, T extends (scraper: AfterAllTools) => Promise<R>>(
    callback: T,
  ) => {
    infoMessage(t("session_actions.after_all"));

    const afterAllResult = $s.setGlobalTimeout(async (cleanUp) => {
      const result = await callback({
        notify: $t.hooks.notify,
        saveAsJson: $t.hooks.saveAsJson,
        logMessage: $t.hooks.logMessage,
      });

      cleanUp();
      return result;
    });

    return afterAllResult;
  };

  return {
    run,
    afterAll,
  };
};

export default Scraper;

import { type DefaultItem, Session, type SessionConfig } from "../..";
import t from "../i18n";
import { infoMessage } from "../logger";
import Puppeteer from "./Puppeteer";
import ScraperTools from "./ScraperTools";
import SessionStore from "./SessionStore";

const runData = {
  run: false,
  afterAll: false,
};

type AfterAllTools = Pick<ReturnType<typeof Session>, "notify"> &
  Pick<ReturnType<typeof Session>, "saveAsJson"> &
  Pick<ReturnType<typeof SessionStore>, "logMessage">;

const Scraper = async (
  baseConfig: Partial<SessionConfig>,
  itemData: Partial<Record<keyof DefaultItem, string>>,
) => {
  // INIT - The order of the following tasks is important
  const $s = Session(baseConfig).init();

  const page = await Puppeteer();
  if (!page) return;

  const $t = ScraperTools($s, page, itemData);

  // SESSION WRAPPERS
  const run = async <R, T extends (scraper: typeof $t) => Promise<R>>(
    callback: T,
  ) => {
    if (runData.run) return;
    runData.run = true;

    return await $s.setGlobalTimeout(async (cleanUp) => {
      await $t.goToPage();
      const result = await callback($t);
      $s.end(false);
      cleanUp();
      return result;
    });
  };

  // TODO: Have a separate timeout for the after-all, too
  const afterAll = async <R, T extends (scraper: AfterAllTools) => Promise<R>>(
    callback: T,
  ) => {
    if (runData.afterAll) return;
    runData.afterAll = true;

    infoMessage(t("session_actions.after_all"));

    return await callback({
      notify: $t.hooks.notify,
      saveAsJson: $t.hooks.saveAsJson,
      logMessage: $t.hooks.logMessage,
    });
  };

  return {
    run,
    afterAll,
  };
};

export default Scraper;

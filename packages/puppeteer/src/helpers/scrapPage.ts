import {
  FullFunction,
  useAction,
  useLocation,
  useLog,
  useRuntimeConfigStore,
  useSession,
} from "@crawlix/core";
import acceptCookies from "./acceptCookies";
import { useScraper } from "../hooks";
import { clickAndNavigate, forceNavigate } from "../utils/navigate";
import { useSelectorsStore } from "../stores";

type ScrapPageOptions = {
  navigation:
    | "click"
    | (string & NonNullable<unknown>)
    | ((index: number) => string);
  forceWait?: number;
};

const scrapPage = async (
  callback: FullFunction,
  options: ScrapPageOptions = { navigation: "click", forceWait: 0 },
) => {
  const { $p } = useScraper();
  const { $a } = useAction();
  const { log } = useLog();
  const { loop } = useSession();
  const { pageUp } = useLocation();
  const { limit } = useRuntimeConfigStore().current.public;
  const { nextPage } = useSelectorsStore().current.selectors;

  await loop("Scrap page loop", limit.page, async (index) => {
    log({
      message: `Scraping page with index '${index}'`,
      category: "SESSION",
    });

    await acceptCookies();
    await callback();

    if (index + 1 === limit.page) return;

    if (options.navigation === "click" && nextPage) {
      await $a("Get next page button", async () => {
        const afterNavigation = clickAndNavigate(
          "Navigate to next page",
          await $p.$(nextPage),
        );

        await afterNavigation(() => {
          pageUp({ url: $p.url() });
        });
      });
    }

    if (options.navigation !== "click") {
      const afterNavigation = forceNavigate(
        {
          name: "Force navigate to specified page",
          forceWait: options.forceWait,
        },
        typeof options.navigation === "function"
          ? options.navigation(index + 1)
          : options.navigation,
      );

      await afterNavigation(() => {
        pageUp({ url: $p.url() });
      });
    }
  });
};

export default scrapPage;

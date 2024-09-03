import {
  FullFunction,
  useAction,
  useLocation,
  useLog,
  useRuntimeConfigStore,
  useSession,
} from "@scraper/core";
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

  await loop(
    (i) => i === limit.page,
    async (index) => {
      log({
        message: `Scraping page with index '${index}'`,
        category: "SESSION",
      });

      await acceptCookies();
      await callback();

      if (index + 1 === limit.page) return;

      if (options.navigation === "click" && nextPage) {
        await $a(
          async () => {
            const afterNavigation = clickAndNavigate(await $p.$(nextPage), {
              name: "Navigate to next page",
            });

            await afterNavigation(() => {
              pageUp({ url: $p.url() });
            });
          },
          { name: "Get next page button" },
        );
      }

      if (options.navigation !== "click") {
        const afterNavigation = forceNavigate(
          typeof options.navigation === "function"
            ? options.navigation(index + 1)
            : options.navigation,
          {
            name: "Force navigate to specified page",
            forceWait: options.forceWait,
          },
        );

        await afterNavigation(() => {
          pageUp({ url: $p.url() });
        });
      }
    },
    { name: "Scrap page loop" },
  );
};

export default scrapPage;

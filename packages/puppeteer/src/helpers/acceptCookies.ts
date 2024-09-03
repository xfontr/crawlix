import { useAction } from "@scraper/core";
import { useScraper } from "../hooks";
import { useSelectorsStore } from "../stores";

const acceptCookies = async () => {
  const { $p } = useScraper();
  const { $a } = useAction();
  const { cookies } = useSelectorsStore().current.selectors;

  if (cookies)
    await $a(
      async () => {
        const acceptButton = await $p.$(cookies);
        await acceptButton?.click();
      },
      { name: "Accept cookies" },
    );
};

export default acceptCookies;

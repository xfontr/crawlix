import { useAction } from "@crawlix/core";
import { useScraper } from "../hooks";
import { useSelectorsStore } from "../stores";

const acceptCookies = async () => {
  const { $p } = useScraper();
  const { $a } = useAction();
  const { cookies } = useSelectorsStore().current.selectors;

  if (!cookies) return;

  await $a("Accept cookies", async () => {
    const acceptButton = await $p.$(cookies);
    await acceptButton?.click();
  });
};

export default acceptCookies;

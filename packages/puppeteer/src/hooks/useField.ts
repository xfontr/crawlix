import { useAction, useLog } from "@scraper/core";
import { useScraper } from ".";
import type { ElementHandle } from "puppeteer";

const useField = (item?: ElementHandle) => {
  const { $a } = useAction();
  const { log } = useLog();
  const { $p } = useScraper();

  const getField = async (
    attribute: "textContent" | "src" | "href",
    name: string,
    selector: string,
    logResult?: boolean,
  ) => {
    if (attribute === "src")
      return await getFieldSrc(name, selector, logResult);
    if (attribute === "href")
      return await getFieldTextHref(name, selector, logResult);

    return await getFieldTextContent(name, selector, logResult);
  };

  const getFieldTextHref = async (
    name: string,
    selector: string,
    logResult?: boolean,
  ) => {
    const result = await $a<string>(
      () => (item ?? $p).$eval(selector, (el: any) => el.href),
      { name: `Get field href '${name}'` },
    );

    if (logResult) log(`${name}: ${result}`);

    return result;
  };

  const getFieldTextContent = async (
    name: string,
    selector: string,
    logResult?: boolean,
  ) => {
    const result = await $a<string>(
      () => (item ?? $p).$eval(selector, (el: any) => el.textContent),
      { name: `Get field text content '${name}'` },
    );

    if (logResult) log(`${name}: ${result}`);

    return result;
  };

  const getFieldSrc = async (
    name: string,
    selector: string,
    logResult?: boolean,
  ) => {
    const result = await $a<string>(
      () => (item ?? $p).$eval(selector, (el: any) => el.src),
      { name: `Get field src '${name}'` },
    );

    if (logResult) log(`${name}: ${result}`);

    return result;
  };

  return { getField };
};

export default useField;

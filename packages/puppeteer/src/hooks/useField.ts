import type { ElementHandle } from "puppeteer";
import type { Selector, SelectorModel, SingleSelectorModel } from "../types";
import { useAction, useLog } from "@scraper/core";
import { useScraper } from ".";
import { useSelectorsStore } from "../stores";
import { getFromOneOrMoreOptions as get } from "../utils";

const useField = (item?: ElementHandle) => {
  const { $a } = useAction();
  const { log } = useLog();
  const { $p } = useScraper();
  const { cleanAttribute } = useSelectorsStore();

  const getHref = (name: string, selector: SingleSelectorModel) =>
    $a<string>(`Get field href '${name}'`, () =>
      (item ?? $p).$eval(selector.selector, (el) => el.href),
    );

  const getTextContent = (name: string, selector: SingleSelectorModel) =>
    selector.selectAll
      ? getAllTextContent(name, selector)
      : $a<string>(`Get field text content '${name}'`, () =>
          (item ?? $p).$eval(selector.selector, (el) => el.textContent),
        );

  const getAllTextContent = (name: string, selector: SingleSelectorModel) =>
    $a<string>(`Get field text content '${name}'`, async () =>
      (
        await (item ?? $p).$$eval(selector.selector, (el) =>
          el.map((n) => n.textContent),
        )
      ).join("; "),
    );

  const getSrc = (name: string, selector: SingleSelectorModel) =>
    $a<string>(`Get field src '${name}'`, () =>
      (item ?? $p).$eval(selector.selector, (el) => el.src),
    );

  const getField = async (
    name: string,
    selector: Selector,
    logResult?: boolean,
  ) => {
    const $s: SelectorModel =
      typeof selector === "string" || Array.isArray(selector)
        ? { selector, attribute: "textContent" }
        : (selector as unknown as SelectorModel);

    let result;

    if ($s.attribute === "src") result = await get(name, $s, getSrc);
    if ($s.attribute === "href") result = await get(name, $s, getHref);
    if ($s.attribute === "textContent")
      result = await get(name, $s, getTextContent);

    result = cleanAttribute(name, result);

    if (logResult) log(`${name}: ${result}`);

    return result;
  };

  return { getField };
};

export default useField;

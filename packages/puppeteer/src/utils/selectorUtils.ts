import { promiseLoop } from "@scraper/core";
import type { SelectorModel, SingleSelectorModel } from "../types";

export const getFromOneOrMoreOptions = async <T = string>(
  name: string,
  selector: SelectorModel,
  callback: (name: string, selector: SingleSelectorModel) => T,
): Promise<T | undefined> => {
  if (!Array.isArray(selector.selector))
    return callback(name, selector as SingleSelectorModel);

  let result: T = undefined as T;

  await promiseLoop(
    async (index) => {
      const updatedSelector: SingleSelectorModel = {
        ...selector,
        selector: selector.selector[index]!,
      };

      result = await callback(name, updatedSelector);
    },
    (i) => i === selector.selector.length - 1 || !!result,
  );

  return result;
};

import { objectEntries, snakelise } from "@personal/utils";
import { SESSION_ID_HEADER } from "../configs/constants";
import type { ItemMeta } from "../types/Item";

export const clean = <T extends string, R = unknown>(
  key: T,
  value: R,
): Record<string, string> => ({
  [snakelise(key)]: typeof value === "string" ? value : JSON.stringify(value),
});

export const cleanElement = (
  key: string,
  rawElement: unknown,
): Record<string, string> =>
  key === "_meta"
    ? objectEntries(rawElement as ItemMeta).reduce(
        (allElements, [$key, value]) => ({
          ...allElements,
          ...clean(`_${$key}`, value),
        }),
        {},
      )
    : clean(key, rawElement);

export const cleanItems = (
  items: Record<string, unknown>[],
  sessionId: string,
) =>
  items.map((item) =>
    Object.entries(item).reduce(
      (allElements, [key, element]) => ({
        ...allElements,
        ...cleanElement(key, element),
      }),
      {
        [SESSION_ID_HEADER]: sessionId,
      },
    ),
  );

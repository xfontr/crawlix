import { objectEntries } from "@personal/utils";
import type UseItemOptions from "../types/UseItemOptions";
import t from "../i18n";
import { ASCII_CHARS, WHITE_SPACES } from "../configs/constants";
import type { ItemMeta, Item, ItemExtraAttributes } from "../types/Item";

const useItem = <T extends ItemExtraAttributes = ItemExtraAttributes>(
  { initialState, ...options }: UseItemOptions<T> = {
    autoClean: true,
  },
) => {
  const item = {
    value: { ...(initialState ?? ({} as Item<T>)) },
  };

  const errorLog = {
    value: {} as ItemMeta<T>["errorLog"],
  };

  const itemHistory = {
    value: [] as {
      item: typeof item.value;
      errorLog: typeof errorLog.value;
    }[],
  };

  const addErrors = (newErrors: ItemMeta["errorLog"]) => {
    errorLog.value = {
      ...errorLog.value,
      ...newErrors,
      ...(errorLog.value?._global ?? newErrors?._global
        ? {
            _global: {
              ...(errorLog.value?._global ?? {}),
              ...(newErrors?._global ?? {}),
            },
          }
        : {}),
    };

    return tools;
  };

  const checkErrors = (): void => {
    const itemEntries = objectEntries(item.value);

    if (!itemEntries.length)
      errorLog.value._global = {
        ...errorLog.value._global,
        [t("session_store.empty_item.key")]: t(
          "session_store.empty_item.value",
        ),
      };

    itemEntries.forEach(([key, value]) => {
      if (
        value === 0 ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        value ||
        (options.requiredType && !options.requiredType?.includes(key))
      )
        return;

      errorLog.value = {
        ...errorLog.value,
        [key]: t("session_store.empty_attribute"),
      };

      return tools;
    });
  };

  const getErrors = (): typeof errorLog.value =>
    JSON.parse(JSON.stringify(errorLog.value));

  const get = (): typeof item.value => JSON.parse(JSON.stringify(item.value));

  const getHistory = (): typeof itemHistory.value =>
    JSON.parse(JSON.stringify(itemHistory.value));

  const setAttributes = (
    newAttributes: Partial<Record<string, string | number> | Item<T>>,
  ) => {
    item.value = {
      ...item.value,
      ...newAttributes,
    };

    return tools;
  };

  const clean = (customCleaner?: UseItemOptions["customCleaner"]) => {
    item.value = objectEntries(item.value).reduce(
      (cleanItem, [currentKey, currentValue]) => {
        if (typeof currentValue !== "string") {
          return { ...cleanItem, [currentKey]: currentValue };
        }

        const defaultClean = currentValue
          .replace(WHITE_SPACES, "")
          .replace(ASCII_CHARS, "")
          .trim();

        const globalClean = options.customCleaner
          ? defaultClean.replace(...options.customCleaner)
          : defaultClean;

        const localClean = customCleaner
          ? globalClean.replace(...customCleaner)
          : globalClean;

        return { ...cleanItem, [currentKey]: localClean };
      },
      {} as typeof item.value,
    );

    return tools;
  };

  const reset = (fullReset?: boolean) => {
    item.value = {} as Item<T>;
    errorLog.value = {} as ItemMeta<T>["errorLog"];

    if (options.enableBackup && fullReset) itemHistory.value = [];

    return tools;
  };

  const use = (callback?: UseItemOptions["callbackUse"]) => {
    if (options.autoClean) clean();
    if (options.autoLogErrors) {
      errorLog.value = (
        errorLog.value?._global ? { _global: errorLog.value?._global } : {}
      ) as ItemMeta<T>["errorLog"];
      checkErrors();
    }
    if (options.enableBackup)
      itemHistory.value.push({
        item: item.value,
        errorLog: errorLog.value,
      });

    callback
      ? callback(item.value as Item<T>, errorLog.value)
      : options.callbackUse?.(item.value as Item<T>, errorLog.value);

    reset(false);

    return tools;
  };

  const tools = {
    /**
     * @description Sets one or more of the items attributes. It can be ran as many
     * times as needed.
     */
    setAttributes,
    /**
     * @returns A copy of the current stored item.
     */
    get,
    /**
     * @returns A copy of the current stored error log.
     */
    getErrors,
    /**
     * @returns A copy of the current history of items and errors.
     */
    getHistory,
    /**
     * @description
     * - If there's a list of minimum attributes, the script will check which
     * ones are lacking and log them as item errors.
     * - If there is no list of minimum attributes, the script will check every
     * single attribute and log the empty ones as errors.
     *
     * The result will be stored and can be retrieved by running the "getErrors"
     * function.
     */
    checkErrors,
    /**
     * @description Allows to manually log item errors.
     */
    addErrors,
    /**
     * @description Runs a callback that expects an item and the error log. Before
     * running said callback, it may run some previous functions that could alter the
     * passed values (depending on the passed options).
     *
     * Its usage it's relevant, because:
     * - Ensures a consistent use of the item
     * - Cleans everything up so that the useItem hook can be reused as many
     * times as needed.
     * - Saves the current item and error in a history, as an emergency backup (if enabled).
     */
    use,
    /**
     * @description Empties the stored items and logged errors.
     * @param fullReset If true, also empties the stored history of items and errors, if any.
     */
    reset,
    /**
     * @description Searches and removes unwanted strings, such as \n, and so on.
     */
    clean,
  };

  return tools;
};

export default useItem;

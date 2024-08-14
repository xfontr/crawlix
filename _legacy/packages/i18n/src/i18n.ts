import internalI18n from "./i18n.locales";
import type { I18nInstance, I18nOptions, Plugin } from "./i18n.types";
import {
  createI18nStore,
  executeBeforeAll,
  functionProxy,
  loadTranslations,
} from "./i18n.utils";
import { join } from "path";

let isInitialized = false;

const i18n = <T extends string | number | symbol>(
  options: I18nOptions = {},
): I18nInstance<T> => {
  const store = createI18nStore(options);
  const $t = internalI18n(store);
  const { logger } = store.log;

  if (isInitialized) {
    throw new Error($t.initializedError);
  }

  const init = () => {
    if (isInitialized) {
      throw new Error($t.initializedError);
    }

    const [file, error] = loadTranslations(store);

    if (error) {
      throw new Error(`${$t.fileError} @ ${join(...options.route!)}`);
    }

    logger($t.initSuccess(), "SUCCESS");

    isInitialized = true;
    store.translations = JSON.parse(file!) as Record<string, any>;

    executeBeforeAll(store);

    return { useI18n, plugins };
  };

  const useI18n = () => {
    if (!isInitialized && !store.autoInit) {
      throw new Error($t.notInitializedError);
    }

    if (!isInitialized) {
      init();
    }

    return (key: string): string => {
      const translation = key
        .split(".")
        .reduce(
          (value, currentKey) =>
            (value?.[currentKey] ?? value) as Record<string, any>,
          store.translations,
        );

      return functionProxy(
        () => {
          if (translation && typeof translation === "string") {
            logger(translation, "MESSAGE");
            return translation;
          }

          const warnMessage = `${store.locale} - ${$t.missingKey(key)}`;

          if (store.log.verbosity.includes("MESSAGE")) {
            logger(warnMessage, "CRITIC");
          }

          return warnMessage;
        },
        {
          before: () => {
            store.beforeEach?.(store);
          },
          after: () => {
            store.afterEach?.(store);
          },
        },
      );
    };
  };

  const plugins = () => {
    if (!isInitialized) {
      throw new Error($t.notInitializedError);
    }

    return store.plugins.reduce(
      (allPlugins, plugin) => ({
        ...allPlugins,
        [plugin.name as T]: plugin(store),
      }),
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
      {} as Record<T, Plugin>,
    );
  };

  return { init, useI18n, plugins };
};

export default i18n;

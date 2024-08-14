import { readFileSync, readdirSync } from "fs";
import { join, extname } from "path";
import type {
  CustomFunction,
  FunctionProxyOptions,
  I18nLogger,
  I18nOptions,
  I18nStore,
  Locale,
  Locales,
  PublicLogOptions,
  VerbosityLevels,
} from "./i18n.types";
import internalI18n from "./i18n.locales";
import { DEFAULT_LOCALE } from "./i18n.configs";

export const syncTryCatch = <
  R,
  T extends CustomFunction<R> = CustomFunction<R>,
>(
  callback: T,
  ...args: Parameters<T>
): [R | undefined, undefined | unknown] => {
  try {
    const response = callback(...args);
    return [response, undefined];
  } catch (error) {
    return [undefined, error];
  }
};

export const requiredLocale = (
  selectedLocale: Locale,
  allowedLocales: Locales,
  fallbackLocale: Locale,
) =>
  allowedLocales.find((locale) => selectedLocale === locale) ?? fallbackLocale;

const getTranslation = (locale: Locale, route: string) =>
  syncTryCatch<string>(readFileSync, join(route, `${locale}.json`), "utf8");

const getAnyTranslation = (route: string): Locale | undefined => {
  const [translationsFolder, error] = syncTryCatch<string[]>(
    readdirSync,
    route,
  );

  return error
    ? undefined
    : (translationsFolder
        ?.find((name) => extname(name) === ".json")
        ?.split(".")[0] as Locale);
};

export const loadTranslations = (store: I18nStore) => {
  const { locale, route: rawRoute, fallbackLocale } = store;
  const { logger } = store.log;
  const $t = internalI18n(store);

  const route = join(...rawRoute);

  const response = getTranslation(locale, route);

  if (response[1]) {
    logger($t.requestedLocaleError, "LIGHT");
    const defaultResponse = getTranslation(fallbackLocale, route);

    if (defaultResponse[1] && store.anyFallback) {
      logger($t.fallbackLocaleError, "LIGHT");
      const emergencyFallback = getAnyTranslation(route);

      if (!emergencyFallback) {
        logger($t.emergencyLocaleError, "LIGHT");
        return defaultResponse;
      }

      const emergencyResponse = getTranslation(emergencyFallback, route);

      store.locale = emergencyFallback;
      logger($t.emergencyLocale(), "LIGHT");
      return emergencyResponse;
    }

    store.locale = fallbackLocale;
    logger($t.fallbackLocale(), "LIGHT");
    return defaultResponse;
  }

  return response;
};

export const i18nLogger: I18nLogger = ({ enabled, loggerTool, verbosity }) => {
  const emojis: Record<Lowercase<VerbosityLevels>, string> = {
    critic: "❗",
    light: "❕",
    message: "💬",
    success: "✅",
  };

  return enabled
    ? (message: string, level: VerbosityLevels): void => {
        if (!(verbosity === "ALL" || verbosity.includes(level))) {
          return;
        }

        loggerTool(
          `${
            emojis[level.toLowerCase() as Lowercase<VerbosityLevels>]
          } ${message}`,
        );
      }
    : (): void => undefined;
};

export const createI18nStore = (options?: I18nOptions): I18nStore => {
  const logOptions: Required<PublicLogOptions> = {
    enabled: true,
    verbosity: "ALL",
    loggerTool: console.warn,
    ...options?.log,
  };

  return {
    autoInit: false,
    allowedLocales: [DEFAULT_LOCALE],
    fallbackLocale: DEFAULT_LOCALE,
    anyFallback: false,
    route: [__dirname, "./locales"],
    locale: requiredLocale(
      options?.locale ?? DEFAULT_LOCALE,
      options?.allowedLocales ?? [DEFAULT_LOCALE],
      options?.fallbackLocale ?? DEFAULT_LOCALE,
    ),
    translations: {},
    beforeAll: undefined,
    beforeEach: undefined,
    afterEach: undefined,
    rawBeforeAll: false,
    plugins: [],
    ...options,
    log: {
      logger: i18nLogger(logOptions),
      ...logOptions,
    },
  };
};

export const functionProxy = <
  T = any,
  F extends CustomFunction<T> = CustomFunction<T>,
>(
  method: F,
  { before, after }: FunctionProxyOptions = {},
): T => {
  before?.();
  const result = method();
  after?.(result);
  return result;
};

export const executeBeforeAll = (store: I18nStore): void => {
  functionProxy(
    () => {
      Object.freeze(store.log);
      Object.freeze(store);
    },
    {
      before: () => {
        if (store.rawBeforeAll) store.beforeAll?.(store);
      },
      after: () => {
        if (store.rawBeforeAll) return;
        store.beforeAll?.(store);
      },
    },
  );
};

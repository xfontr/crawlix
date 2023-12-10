export type CustomFunction<T = any> = (...args: any[]) => T;
export type PromiseFunction<T = any> = CustomFunction<Promise<T>>;
export type Locale = `${Uppercase<string>}-${Lowercase<string>}`;
export type Locales = Readonly<Locale[]>;
export type VerbosityLevels = "CRITIC" | "LIGHT" | "SUCCESS" | "MESSAGE";

export type I18nLogger = (
  options: Required<PublicLogOptions>,
) => ((message: string, level: VerbosityLevels) => void) | (() => void);

export type Plugin = CustomFunction<(store: I18nStore) => unknown>;

export type LogOptions = Partial<{
  /**
   * Function provided to log a message in the console.
   * @default console.warn
   */
  loggerTool: Function;
  /**
   * Custom log function provided by the tool. Becomes readonly once the store inits.
   * @readonly
   */
  logger: ReturnType<I18nLogger>;
  /**
   * Allows the user to set what sort of messages wants to see logged.
   * @argument CRITIC Relevant (not app-breaking) errors and other important messages.
   * @argument LIGHT Informative messages or light errors.
   * @argument MESSAGE Every time the tool is called, will show the translation
   * @argument ALL Will simply log everything
   */
  verbosity: VerbosityLevels[] | "ALL";
  /**
   * Toggles the logger.
   */
  enabled: boolean;
}>;

export type PublicLogOptions = Omit<LogOptions, "logger">;

export type I18nOptions = Partial<{
  /**
   * Inits the store when using the localization tool, if it hasn't been instantiated before.
   * If false, it will be required to manually init it.
   *
   * @default false
   */
  autoInit: boolean;
  /**
   * @default "GB-en"
   */
  locale: Locale;
  /**
   * @default "GB-en"
   */
  fallbackLocale: Locale;
  /**
   * @default ["GB-en"]
   */
  allowedLocales: Locales;
  /**
   * If translations are not found anywhere, the tool will search for any localization file in the
   * route. Could lead to unexpected behavior, as it will load the first found .json file, if any.
   *
   * @default false
   */
  anyFallback: boolean;
  route: string[];
  log: PublicLogOptions;
  /**
   * Function that will be executed once the store has been initialized,
   * with access to the unfrozen store.
   *
   * @example ({ translations }) => { console.log(`See the translations: ${translations}`) }
   * @default undefined
   */
  beforeAll: ((store: I18nStore) => void) | undefined;
  /**
   * **Use with caution:** If true, the beforeAll function will be executed
   * before the store being frozen.
   *
   * @default false
   */
  rawBeforeAll: boolean;
  beforeEach: ((store: I18nStore) => void) | undefined;
  afterEach: ((store: I18nStore) => void) | undefined;
  /**
   * List of functions that will be returned by the i18n tool itself,
   * for the user to call whenever it requires it..
   *
   * @example [({ translations }) => { console.log(`See the translations: ${translations}`) }, ...plugins]
   * @default []
   */
  plugins: Plugin[];
}>;

export type I18nStore = Required<
  {
    translations: Record<string, any>;
  } & Required<I18nOptions> & {
      log: Required<LogOptions>;
    }
>;

export type I18nInstance<T extends string | number | symbol> = {
  useI18n: () => (key: string) => string;
  init: () => {
    useI18n: () => (key: string) => string;
    plugins: () => Record<T, Plugin>;
  };
  plugins: () => Record<T, Plugin>;
};

export type FunctionProxyOptions<T = any, R = any> = {
  before?: CustomFunction<T>;
  after?: (result: T) => R;
};

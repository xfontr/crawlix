import type {
  I18nInstance,
  I18nLogger,
  I18nOptions,
  I18nStore,
  Locale as I18nLocale,
  Locales as I18nLocales,
  Plugin as I18nPlugin,
  VerbosityLevels as I18nVerbosityLevels,
  PublicLogOptions as I18nLogOptions,
} from "./src/i18n.types";

import i18n from "./src/i18n";

export {
  type I18nInstance,
  type I18nLogger,
  type I18nOptions,
  type I18nStore,
  type I18nLocale,
  type I18nLocales,
  type I18nPlugin,
  type I18nVerbosityLevels,
  type I18nLogOptions,
};

export default i18n;

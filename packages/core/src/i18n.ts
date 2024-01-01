import i18n from "@personal/i18n";
import ENVIRONMENT from "./configs/environment";
import type { Locale } from "@personal/i18n/src/i18n.types";

const { useI18n } = i18n({
  autoInit: true,
  route: [__dirname, "./locales"],
  log: {
    enabled: false,
  },
  locale: ENVIRONMENT.locale as Locale,
});

const t = useI18n();

export default t;

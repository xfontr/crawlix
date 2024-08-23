import i18n from "../../legacy-i18n";
import ENVIRONMENT from "./configs/environment";

const { useI18n } = i18n({
  autoInit: true,
  route: [__dirname, "./locales"],
  log: {
    enabled: false,
  },
  locale: ENVIRONMENT.locale,
});

const t = useI18n();

export default t;

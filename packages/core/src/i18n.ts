import i18n from "@personal/i18n";

const { useI18n } = i18n({
  autoInit: true,
  route: [__dirname, "./locales"],
  log: {
    enabled: false,
  },
});

const t = useI18n();

export default t;

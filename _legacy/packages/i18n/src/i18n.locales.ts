import { type I18nStore } from "./i18n.types";

const internalI18n = (store: I18nStore) => {
  const defaultTranslations = {
    // Critic
    fileError: "Couldn't read the translations file",
    notInitializedError:
      "The i18n tool hasn't been initialized yet. Please init the store before using it",
    initializedError: "The i18n tool has already been initialized",
    missingKey: (key: string) => `Missing key: ${key}`,
    requestedLocaleError: "Couldn't access the requested locale",
    fallbackLocaleError: "Couldn't access the fallback locale",
    emergencyLocaleError: "Couldn't find any alternative locale file",

    // Light
    fallbackLocale: () => `Using the fallback locale ${store.fallbackLocale}`,
    emergencyLocale: () =>
      `Using an alternative fallback locale, ${store.locale}`,

    // Success
    initSuccess: () => `Locale successfully set at ${store.locale}`,
  };

  return (
    {
      "GB-en": defaultTranslations,
      "ES-es": {
        ...defaultTranslations,
        // Critic
        fileError: "No se pudo leer el archivo de traducciones",
        notInitializedError:
          "La herramienta de internacionalización (i18n) aún no ha sido inicializada. Por favor, inicialízala antes de usarla",
        initializedError:
          "La herramienta de internacionalización (i18n) ha sido inicializada",
        missingKey: (key: string) => `Clave no encontrada: ${key}`,
        requestedLocaleError: "No se pudo acceder al idioma solicitado",
        fallbackLocaleError: "No se pudo acceder al idioma de respaldo",
        emergencyLocaleError:
          "No se pudo encontrar ningún archivo de idioma alternativo",

        // Light
        fallbackLocale: () =>
          `Usando el idioma de respaldo ${store.fallbackLocale}`,
        emergencyLocale: () =>
          `Usando un idioma de respaldo alternativo, ${store.locale}`,

        // Success
        initSuccess: () => `Idioma establecido exitosamente en ${store.locale}`,
      },
      "DE-de": {
        ...defaultTranslations,
        // Critic
        fileError: "Konnte die Übersetzungsdatei nicht lesen",
        notInitializedError:
          "Das i18n-Tool wurde noch nicht initialisiert. Bitte initialisiere den Store, bevor du es verwendest",
        initializedError: "Das i18n-Tool wurde bereits initialisiert",
        missingKey: (key: string) => `Schlüssel nicht gefunden: ${key}`,
        requestedLocaleError: "Konnte die angeforderte Sprache nicht abrufen",
        fallbackLocaleError: "Konnte nicht auf die Ersatzsprache zugreifen",
        emergencyLocaleError: "Konnte keine alternative Sprachdatei finden",

        // Light
        fallbackLocale: () =>
          `Verwende die Ersatzsprache ${store.fallbackLocale}`,
        emergencyLocale: () =>
          `Verwende eine alternative Ersatzsprache, ${store.locale}`,

        // Success
        initSuccess: () => `Sprache erfolgreich auf ${store.locale} festgelegt`,
      },
    }[store.locale as string] ?? defaultTranslations
  );
};

export default internalI18n;

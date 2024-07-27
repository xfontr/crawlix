import type { RuntimeConfig, RuntimeConfigStore } from "../types";
import envVar from "../utils/envVar";
import { clone } from "../utils/utils";

const v = (...keys: string[]): string =>
  `SCRAPER_${keys.join("_")}`.toLocaleUpperCase();

const state: { value: RuntimeConfigStore } = {
  value: {
    node: {
      env: envVar("NODE_ENV", "dev"),
    },
    offset: {
      page: envVar(v("offset", "page"), 0, { required: true }),
      url: envVar(v("offset", "url"), "", { required: true }),
    },
    limit: {
      page: envVar(v("limit", "page"), 0),
      timeout: envVar(v("limit", "timeout"), 50_000),
    },
    logging: {
      actionsDepth: envVar(v("logging", "actions"), 7),
      locationUpdate: envVar(v("logging", "locationUpdate"), true),
      maxCriticality: envVar(v("logging", "locationUpdate"), 5),
      logErrors: envVar(v("logging", "logErrors"), true),
      typeFilter: envVar(
        v("logging", "locationUpdate"),
        ["DEBUG", "DEV", "ERROR", "INFO", "WARN"],
        { type: "array" },
      ),
      isSimple: envVar(v("logging", "isSimple"), false),
    },
    mockUserPause: {
      duration: envVar(v("mockUserPause", "duration"), 500),
      variationRange: envVar(v("mockUserPause", "variationRange"), [0.6, 1], {
        type: "array",
      }),
    },
    storeContent: envVar(
      v("storeContent"),
      [
        "actionData",
        "configs",
        "errorData",
        "itemData",
        "locationData",
        "logData",
      ],
      { type: "array" },
    ),
    fatalErrorDepth: envVar("fatalErrorDepth", 1),
    completionRateToSuccess: envVar(v("completionRateToSuccess"), 95),
  },
};

const useRuntimeConfigStore = () => {
  const configs = (): RuntimeConfig => clone(state.value);

  const setRuntimeConfig = (configs?: Partial<RuntimeConfig>) => {
    state.value = { ...state.value, ...configs };
  };

  return {
    configs,
    setRuntimeConfig,
  };
};

export default useRuntimeConfigStore;

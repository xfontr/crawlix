import type { RuntimeConfig, RuntimeConfigStore } from "../types";
import { createStore } from "../utils/stores";
import envVar from "../utils/envVar";
import { useSessionStore } from ".";
import { DeepPartial } from "../types/UtilityTypes";
import deepmerge from "deepmerge";

const v = (...keys: string[]): string =>
  `SCRAPER_${keys.join("_")}`.toLocaleUpperCase();

const initialState: RuntimeConfigStore = {
  public: {
    node: {
      env: envVar("NODE_ENV", "dev"),
    },
    offset: {
      page: envVar(v("offset", "page"), 0),
      url: envVar(v("offset", "url"), ""),
    },
    limit: {
      page: envVar(v("limit", "page"), 10),
      timeout: envVar(v("limit", "timeout"), 50_000),
      inactivityTimeout: envVar(v("limit", "inactivityTimeout"), 5_000),
    },
    logging: {
      actionsDepth: envVar(v("logging", "actions"), 7),
      locationUpdate: envVar(v("logging", "locationUpdate"), true),
      maxCriticality: envVar(v("logging", "maxCriticality"), 5),
      logErrors: envVar(v("logging", "logErrors"), true),
      typeFilter: envVar(
        v("logging", "typeFilter"),
        ["DEBUG", "DEV", "ERROR", "INFO", "WARN"],
        { type: "array" },
      ),
      isSimple: envVar(v("logging", "isSimple"), false), // TODO: Feature pending implementation
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
        "action",
        "runtimeConfig",
        "error",
        "item",
        "session",
        "location",
        "log",
      ],
      { type: "array" },
    ),
    fatalErrorDepth: envVar("fatalErrorDepth", 0),
    completionRateToSuccess: envVar(v("completionRateToSuccess"), 95),
    endProcessIfOver: envVar(v("endProcessIfOver"), true),
  },
};

const useRuntimeConfigStore = createStore(
  "runtimeConfig",
  initialState,
  (state) => {
    const setRuntimeConfig = (configs?: DeepPartial<RuntimeConfig>) => {
      if (!useSessionStore().isIDLE()) return;

      state.public = Object.freeze(
        deepmerge(state.public, configs as RuntimeConfig),
      ) as RuntimeConfig;
    };

    return { setRuntimeConfig };
  },
);

export default useRuntimeConfigStore;

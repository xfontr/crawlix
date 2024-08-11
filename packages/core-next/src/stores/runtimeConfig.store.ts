import type { RuntimeConfig, RuntimeConfigStore } from "../types";
import createStore from "../utils/stores";
import envVar from "../utils/envVar";
import useSessionStore from "./session.store";

const v = (...keys: string[]): string =>
  `SCRAPER_${keys.join("_")}`.toLocaleUpperCase();

const initialState: RuntimeConfigStore = {
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
};

const useRuntimeConfigStore = createStore(
  "runtimeConfig",
  initialState,
  (state) => {
    const setRuntimeConfig = (configs?: Partial<RuntimeConfig>) => {
      if (!useSessionStore().isIDLE()) return;

      state = { ...state, ...configs }; // TODO: CHECK IF THIS WORKS AFTER STORE REFACTOR
    };

    return { setRuntimeConfig };
  },
);

export default useRuntimeConfigStore;

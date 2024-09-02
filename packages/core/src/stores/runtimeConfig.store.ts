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
    model: envVar(v("model"), "Scraper session"),
    node: {
      env: envVar("NODE_ENV", "dev"),
    },
    offset: {
      index: envVar(v("offset", "index"), 0),
      page: envVar(v("offset", "page"), 0),
      url: envVar(v("offset", "url"), ""),
    },
    limit: {
      page: envVar(v("limit", "page"), 10),
      timeout: envVar(v("limit", "timeout"), 50_000),
      inactivity: envVar(v("limit", "inactivity"), 5_000),
    },
    logging: {
      maxCriticality: envVar(v("logging", "max_criticality"), 5),
      types: envVar(
        v("logging", "types"),
        ["DEBUG", "DEV", "ERROR", "INFO", "WARN"],
        { type: "array" },
      ),
      categories: envVar(
        v("logging", "categories"),
        ["USER_INPUT", "ERROR", "ACTION", "LOCATION"],
        { type: "array" },
      ),
      isSimple: envVar(
        v("logging", "is_simple"),
        ["USER_INPUT", "ACTION", "LOCATION"],
        { type: "array" },
      ),
    },
    mockUserPause: {
      duration: envVar(v("mock_user_pause", "duration"), 500),
      variationRange: envVar(
        v("mock_user_pause", "variation_range"),
        [0.6, 1],
        { type: "array" },
      ),
    },
    output: {
      schema: envVar(v("output", "schema"), "RELATIONAL"),
      include: envVar(
        v("output", "include"),
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
      itemWithMetaLayer: envVar(v("output", "item_with_meta_layer"), true),
    },
    fatalErrorDepth: envVar("fatal_error_depth", 0),
    successCompletionRate: envVar(v("success_completion_rate"), 95),
    endProcess: envVar(v("end_process"), true),
  },
};

const useRuntimeConfigStore = createStore(
  "runtimeConfig",
  initialState,
  (state) => {
    const setRuntimeConfig = (configs?: DeepPartial<RuntimeConfig>) => {
      if (!useSessionStore().isIDLE()) return;
      state.public = Object.freeze(
        deepmerge(state.public, configs as RuntimeConfig, {
          arrayMerge: (_, sourceArray) => sourceArray,
        }),
      ) as RuntimeConfig;
    };

    const isRelational = () => state.public.output.schema === "RELATIONAL";

    return { setRuntimeConfig, isRelational };
  },
);

export default useRuntimeConfigStore;

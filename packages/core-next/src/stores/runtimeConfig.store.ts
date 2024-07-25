import type { RuntimeConfig } from "../types/RuntimeConfig.type";
import type { RuntimeConfigStore } from "../types/Store.type";
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
    fatalErrorDepth: envVar("fatalErrorDepth", 1),
    completionRateToSuccess: envVar(v("completionRateToSuccess"), 95),
  },
};

const useRuntimeConfigStore = () => {
  const getRuntimeConfig = (): RuntimeConfig => clone(state.value);

  const setRuntimeConfig = (configs?: Partial<RuntimeConfig>) => {
    state.value = { ...state.value, ...configs };
  };

  return {
    getRuntimeConfig,
    setRuntimeConfig,
  };
};

export default useRuntimeConfigStore;

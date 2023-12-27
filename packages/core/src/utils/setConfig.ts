import ENVIRONMENT from "../configs/environment";
import {
  GLOBAL_TIMEOUT_MAX,
  LIMIT_ITEMS_MAX,
  LIMIT_PAGES_MAX,
  TIMEOUT_MAX,
  TASK_LENGTH_MAX,
} from "../configs/session";
import SessionConfig from "../types/SessionConfig";

/**
 * TODO: If we allow this to be set outside of the script itself, add more checkers:
 * - Verify they are actually numbers
 * - Add minimum values
 */
export const defaultSessionConfig: SessionConfig = {
  offset: {
    url: ENVIRONMENT.baseUrl,
    page: 1,
  },
  limit: {
    items: 150,
    page: 0,
  },
  timeout: 3_000,
  taskLength: 800,
  globalTimeout: 10 * 30 * 1_000,
  minimumItemsToSuccess: 0.99,
  usageData: false,
};

const getMax = (max: number, fallback: number, value?: number): number =>
  ((value ?? 0) > max ? max : value) ?? fallback;

export const setConfig = (config?: Partial<SessionConfig>): SessionConfig => ({
  ...defaultSessionConfig,
  ...config,
  offset: {
    ...defaultSessionConfig.offset,
    ...config?.offset,
  },
  limit: {
    items: getMax(
      LIMIT_ITEMS_MAX,
      defaultSessionConfig.limit.items!,
      config?.limit?.items,
    ),
    page: getMax(
      LIMIT_PAGES_MAX,
      defaultSessionConfig.limit.page!,
      config?.limit?.page,
    ),
  },
  globalTimeout: getMax(
    GLOBAL_TIMEOUT_MAX,
    defaultSessionConfig.globalTimeout,
    config?.globalTimeout,
  ),
  timeout: getMax(TIMEOUT_MAX, defaultSessionConfig.timeout, config?.timeout),
  taskLength: getMax(
    TASK_LENGTH_MAX,
    defaultSessionConfig.taskLength,
    config?.taskLength,
  ),
});

export default setConfig;

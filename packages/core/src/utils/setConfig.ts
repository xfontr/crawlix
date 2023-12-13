import { TASK_LENGTH_MAX } from "../configs/scraper";
import { GLOBAL_TIMEOUT_MAX, LIMIT_MAX, TIMEOUT_MAX } from "../configs/session";
import SessionConfig from "../types/SessionConfig";

export const defaultSessionConfig: SessionConfig = {
  offset: {
    page: 0,
  },
  limit: 50,
  timeout: 1_000,
  taskLength: 800,
  globalTimeout: 10 * 30 * 1_000,
};

const getMax = (max: number, fallback: number, value?: number) =>
  ((value ?? 0) > max ? max : value) ?? fallback;

export const setConfig = (config?: Partial<SessionConfig>): SessionConfig => ({
  ...defaultSessionConfig,
  ...config,
  limit: getMax(LIMIT_MAX, defaultSessionConfig.limit, config?.limit),
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

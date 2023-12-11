import { LIMIT_MAX } from "../configs/session";
import SessionConfig from "../types/SessionConfig";

export const defaultSessionConfig: SessionConfig = {
  offset: {
    page: 0,
  },
  limit: 50,
  timeout: 1_000,
};

export const setConfig = (config?: Partial<SessionConfig>): SessionConfig => ({
  ...defaultSessionConfig,
  ...config,
  limit:
    ((config?.limit ?? 0) > LIMIT_MAX ? LIMIT_MAX : config?.limit) ??
    defaultSessionConfig.limit,
});

export default setConfig;

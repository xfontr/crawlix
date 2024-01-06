import SessionConfig from "../../types/SessionConfig";

const mockSessionConfig: SessionConfig = {
  limit: {
    items: 5,
    page: 0,
  },
  offset: { page: 4, url: "" },
  timeout: 3_500,
  globalTimeout: 10 * 30 * 1_000,
  afterAllTimeout: 5 * 10 * 1_000,
  taskLength: 800,
  minimumItemsToSuccess: 0.99,
  usageData: false,
  allowDefaultConfigs: true,
  emailing: undefined,
  safeMode: true,
};

export default mockSessionConfig;

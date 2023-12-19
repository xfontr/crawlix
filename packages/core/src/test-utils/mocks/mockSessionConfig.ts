import SessionConfig from "../../types/SessionConfig";

const mockSessionConfig: SessionConfig = {
  limit: {
    items: 5,
    page: 0,
  },
  offset: { page: 4, item: "shoes", errorMargin: 0, itemNumber: 0, url: "" },
  timeout: 3_500,
  globalTimeout: 10 * 30 * 1_000,
  taskLength: 800,
};

export default mockSessionConfig;

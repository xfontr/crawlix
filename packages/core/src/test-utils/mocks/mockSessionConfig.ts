import SessionConfig from "../../types/SessionConfig";

const mockSessionConfig: SessionConfig = {
  limit: 5, // Must not exceed the max set @ configs/session
  offset: { page: 4, item: "shoes" },
  timeout: 3_500,
};

export default mockSessionConfig;

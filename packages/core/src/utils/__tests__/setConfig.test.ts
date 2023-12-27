import {
  GLOBAL_TIMEOUT_MAX,
  LIMIT_ITEMS_MAX,
  TIMEOUT_MAX,
  TASK_LENGTH_MAX,
} from "../../configs/session";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";
import SessionConfig from "../../types/SessionConfig";
import setConfig, { defaultSessionConfig } from "../setConfig";

describe("Given a setConfig function", () => {
  describe("When called with full and valid session configs", () => {
    test("Then it should return the exact same values", () => {
      const config = setConfig(mockSessionConfig);

      expect(config).toStrictEqual(mockSessionConfig);
    });
  });

  describe("When called with full session configs, where the limit is excessive", () => {
    test("Then it should return the passed values, but with a maxed limit", () => {
      const config = setConfig({
        ...mockSessionConfig,
        limit: {
          items: LIMIT_ITEMS_MAX + 1,
          page: 0,
        },
        globalTimeout: GLOBAL_TIMEOUT_MAX + 1,
        timeout: TIMEOUT_MAX + 1,
        taskLength: TASK_LENGTH_MAX + 1,
      });

      expect(config).toStrictEqual({
        ...mockSessionConfig,
        limit: {
          items: LIMIT_ITEMS_MAX,
          page: 0,
        },
        globalTimeout: GLOBAL_TIMEOUT_MAX,
        timeout: TIMEOUT_MAX,
        taskLength: TASK_LENGTH_MAX,
      });
    });
  });

  describe("When called with partial session configs", () => {
    test("Then it should return the default values to fill the blanks", () => {
      const passedSessionConfig: Partial<SessionConfig> = {
        offset: { page: 2 },
      };

      const config = setConfig(passedSessionConfig);

      expect(config).toStrictEqual({
        ...defaultSessionConfig,
        ...passedSessionConfig,
        offset: {
          ...defaultSessionConfig.offset,
          ...passedSessionConfig.offset,
        },
      });
    });
  });
});

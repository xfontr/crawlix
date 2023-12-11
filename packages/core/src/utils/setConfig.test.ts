import { LIMIT_MAX } from "../configs/session";
import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import SessionConfig from "../types/SessionConfig";
import setConfig, { defaultSessionConfig } from "./setConfig";

describe("Given a setConfig function", () => {
  describe("When called with full and valid session configs", () => {
    test("Then it should return the exact same values", () => {
      const config = setConfig(mockSessionConfig);

      expect(config).toStrictEqual(mockSessionConfig);
    });
  });

  describe("When called with full session configs, where the limit is excessive", () => {
    test("Then it should return the passed values, but with a maxed limit", () => {
      const config = setConfig({ ...mockSessionConfig, limit: LIMIT_MAX + 1 });

      expect(config).toStrictEqual({ ...mockSessionConfig, limit: LIMIT_MAX });
    });
  });

  describe("When called with partial session configs", () => {
    test("Then it should return the default values to fill the blanks", () => {
      const passedSessionConfig: Partial<SessionConfig> = { limit: 10 };
      const config = setConfig(passedSessionConfig);

      expect(config).toStrictEqual({
        ...defaultSessionConfig,
        ...passedSessionConfig,
      });
    });
  });
});
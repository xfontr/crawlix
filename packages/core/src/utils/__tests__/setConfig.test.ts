import {
  GLOBAL_TIMEOUT_MAX,
  LIMIT_ITEMS_MAX,
  TIMEOUT_MAX,
  TASK_LENGTH_MAX,
  GLOBAL_TIMEOUT_DEFAULT,
  LIMIT_ITEMS_DEFAULT,
  LIMIT_PAGES_DEFAULT,
  MINIMUM_ITEMS_TO_SUCCESS_DEFAULT,
  TASK_LENGTH_DEFAULT,
  TIMEOUT_DEFAULT,
  USAGE_DATA_DEFAULT,
  ALLOW_DEFAULT_CONFIGS_DEFAULT,
} from "../../configs/session";
import t from "../../i18n";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";
import SessionConfig from "../../types/SessionConfig";
import setConfig, { defaultSessionConfig, setDefault } from "../setConfig";

const mockWarn = jest.fn();

/**
 * Source of this .env solution:
 * https://stackoverflow.com/questions/48033841/test-process-env-with-jest
 */
const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV };
});

afterAll(() => {
  process.env = OLD_ENV;
});

jest.mock("pino", () => () => ({
  warn: (message: string) => mockWarn(message),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

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
        ...defaultSessionConfig(),
        ...passedSessionConfig,
        offset: {
          ...defaultSessionConfig().offset,
          ...passedSessionConfig.offset,
        },
      });
    });
  });
});

describe("Given a setDefault.checkNumber function", () => {
  const { $n } = setDefault("true");
  const defaultValue = 4;

  describe("When called with a valid number", () => {
    test("Then it should return the same number", () => {
      const number = "10";

      const result = $n(number, defaultValue);

      expect(result).toBe(+number);
    });
  });

  describe("When called with '-1'", () => {
    test("Then it should return the default number and send a warning message", () => {
      const number = "-1";

      const result = $n(number, defaultValue);

      expect(result).toBe(defaultValue);
      expect(mockWarn).toHaveBeenCalledWith(
        t("session.warning.invalid_env_config"),
      );
    });

    test("Then it should throw an error if no defaults are allowed", () => {
      const { $n: checkNumber } = setDefault("false");

      const number = "-1";

      expect(() => checkNumber(number, defaultValue)).toThrow(
        Error(t("session.error.no_defaults")),
      );
      expect(mockWarn).toHaveBeenCalledWith(
        t("session.warning.invalid_env_config"),
      );
    });
  });

  describe("When called with no value", () => {
    test("Then it should return the default number", () => {
      const number = undefined;

      const result = $n(number, defaultValue);

      expect(result).toBe(defaultValue);
      expect(mockWarn).toHaveBeenCalledWith(
        t("session.warning.invalid_env_config"),
      );
    });
  });
});

describe("Given a setDefault.checkBoolean function", () => {
  const { $b } = setDefault(true);
  const defaultValue = "defaultValue" as unknown as boolean;

  describe("When called with a value of 'true'", () => {
    test("Then it should return true", () => {
      const value = "true";

      const result = $b(value, defaultValue);

      expect(result).toBe(true);
    });
  });

  describe("When called with a value of '999'", () => {
    test("Then it should return false", () => {
      const value = "999";

      const result = $b(value, defaultValue);

      expect(result).toBe(false);
    });
  });

  describe("When called with no value", () => {
    test("Then it should return the default value and send a warning message", () => {
      const value = undefined;

      const result = $b(value, defaultValue);

      expect(result).toBe(defaultValue);
      expect(mockWarn).toHaveBeenCalledWith(
        t("session.warning.invalid_env_config"),
      );
    });

    test("Then it should throw an error if no defaults are allowed", () => {
      const { $b: checkBoolean } = setDefault(false);
      const value = undefined;

      expect(() => checkBoolean(value, defaultValue)).toThrow(
        Error(t("session.error.no_defaults")),
      );
      expect(mockWarn).toHaveBeenCalledWith(
        t("session.warning.invalid_env_config"),
      );
    });
  });
});

describe("Given a defaultSessionConfig function", () => {
  describe("When called with no env variables set (or invalid ones)", () => {
    process.env["SCRAPER_URL"] = undefined;
    process.env["SCRAPER_OFFSET_PAGE"] = undefined;
    process.env["SCRAPER_LIMIT_ITEMS"] = undefined;
    process.env["SCRAPER_LIMIT_PAGE"] = undefined;
    process.env["SCRAPER_TIMEOUT"] = undefined;
    process.env["SCRAPER_TASK_LENGTH"] = undefined;
    process.env["SCRAPER_GLOBAL_TIMEOUT"] = "aaa"; // Expects a number
    process.env["SCRAPER_MINIMUM_ITEMS_TO_SUCCESS"] = undefined;
    process.env["SCRAPER_USAGE_DATA"] = "999"; // Expects a boolean
    process.env["SCRAPER_ALLOW_DEFAULT_CONFIGS"] = undefined;

    test("Then it should set all the default values, if allowed", () => {
      const expectedDefaultConfig: SessionConfig = {
        allowDefaultConfigs: ALLOW_DEFAULT_CONFIGS_DEFAULT,
        globalTimeout: GLOBAL_TIMEOUT_DEFAULT,
        limit: {
          items: LIMIT_ITEMS_DEFAULT,
          page: LIMIT_PAGES_DEFAULT,
        },
        minimumItemsToSuccess: MINIMUM_ITEMS_TO_SUCCESS_DEFAULT,
        offset: {
          url: "",
          page: 1,
        },
        taskLength: TASK_LENGTH_DEFAULT,
        timeout: TIMEOUT_DEFAULT,
        usageData: USAGE_DATA_DEFAULT,
      };

      const result = defaultSessionConfig(true);

      expect(result).toStrictEqual(expectedDefaultConfig);
    });

    test("Then it should throw an error, if no default values are allowed", () => {
      expect(() => defaultSessionConfig(false)).toThrow(
        Error(t("session.error.no_defaults")),
      );
    });

    test("Then it should throw an error, if no default values, as set by the actual default values", () => {
      process.env["SCRAPER_ALLOW_DEFAULT_CONFIGS"] = undefined;

      if (ALLOW_DEFAULT_CONFIGS_DEFAULT) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(defaultSessionConfig).not.toThrow(
          Error(t("session.error.no_defaults")),
        );
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(defaultSessionConfig).toThrow(
          Error(t("session.error.no_defaults")),
        );
      }
    });
  });
});

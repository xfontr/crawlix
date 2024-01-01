import ENVIRONMENT from "../../configs/environment";
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
  SAVE_SESSION_ON_ERROR_DEFAULT,
} from "../../configs/session";
import t from "../../i18n";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";
import SessionConfig from "../../types/SessionConfig";
import setConfig, { defaultSessionConfig, setDefault } from "../setConfig";

const mockWarn = jest.fn();

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
        emailing: undefined,
      });
    });
  });

  describe("When called with at least one emailing config variable", () => {
    test("Then it should set an 'emailing' attribute with only said variable", () => {
      const emailUser = "test@test.com";

      const expectedEmailingConfig: SessionConfig["emailing"] = {
        host: "",
        password: "",
        port: 0,
        receiverEmail: "",
        user: emailUser,
      };

      const { emailing } = setConfig({ emailing: { user: emailUser } });

      expect(emailing).toStrictEqual(expectedEmailingConfig);
    });
  });

  describe("When called with no emailing variables", () => {
    test("Then it should set an empty 'emailing' attribute", () => {
      const { emailing } = setConfig();

      expect(emailing).toBeUndefined();
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
    ENVIRONMENT.baseUrl = undefined as unknown as string;
    ENVIRONMENT.offsetPage = undefined;
    ENVIRONMENT.limitItems = undefined;
    ENVIRONMENT.limitPage = undefined;
    ENVIRONMENT.timeout = undefined;
    ENVIRONMENT.taskLength = undefined;
    ENVIRONMENT.globalTimeout = "aaa"; // Expects a number;
    ENVIRONMENT.minimumItemsToSuccess = undefined;
    ENVIRONMENT.usageData = "999"; // Expects a boolean;
    ENVIRONMENT.allowDefaultConfigs = undefined;
    ENVIRONMENT.email.host = undefined;
    ENVIRONMENT.email.password = undefined;
    ENVIRONMENT.email.port = undefined;
    ENVIRONMENT.email.receiverEmail = undefined;
    ENVIRONMENT.email.user = undefined;

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
        emailing: {
          host: "",
          password: "",
          port: 0,
          receiverEmail: "",
          user: "",
        },
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

  describe("When called with all valid env variables", () => {
    test("Then it should set all of them in the right format", () => {
      ENVIRONMENT.baseUrl = "www.test.com";
      ENVIRONMENT.offsetPage = "1";
      ENVIRONMENT.limitItems = "100";
      ENVIRONMENT.limitPage = "20";
      ENVIRONMENT.timeout = "9000";
      ENVIRONMENT.taskLength = "100";
      ENVIRONMENT.globalTimeout = "100";
      ENVIRONMENT.minimumItemsToSuccess = "0.6";
      ENVIRONMENT.usageData = "true";
      ENVIRONMENT.allowDefaultConfigs = "true";
      ENVIRONMENT.email.host = "test.test";
      ENVIRONMENT.email.password = "test";
      ENVIRONMENT.email.port = "465";
      ENVIRONMENT.email.receiverEmail = "test@test.com";
      ENVIRONMENT.email.user = "test@tester.com";

      const expectedDefaultConfig: SessionConfig = {
        allowDefaultConfigs: true,
        globalTimeout: 100,
        limit: {
          items: 100,
          page: 20,
        },
        minimumItemsToSuccess: 0.6,
        offset: {
          url: "www.test.com",
          page: 1,
        },
        taskLength: 100,
        timeout: 9000,
        usageData: true,
        emailing: {
          host: "test.test",
          password: "test",
          port: 465,
          receiverEmail: "test@test.com",
          user: "test@tester.com",
        },
      };

      const defaultConfig = defaultSessionConfig();

      expect(defaultConfig).toStrictEqual(expectedDefaultConfig);
    });
  });
});

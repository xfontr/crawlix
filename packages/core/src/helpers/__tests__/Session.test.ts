import { LIMIT_ITEMS_MAX } from "../../configs/session";
import t from "../../i18n";
import mockSessionConfig from "../../test-utils/mocks/mockSessionConfig";
import SessionConfig from "../../types/SessionConfig";
import EventBus from "../../utils/EventBus";
import setConfig from "../../utils/setConfig";
import Session from "../Session";

jest.useFakeTimers();

const mockInit = jest.fn();
const mockEnd = jest.fn();
const mockLogError = jest.fn();

const mockGlobalTimeout = 10;

jest.mock("../SessionStore", () => () => ({
  init: (config: SessionConfig) => mockInit(config),
  end: (...args: unknown[]) => mockEnd(...args),
  current: () => ({
    globalTimeout: 10,
  }),
  logError: (...args: unknown[]) => mockLogError(...args),
}));

const mockInfoMessage = jest.fn();
const mockErrorMessage = jest.fn();
const mockWarningMessage = jest.fn();

jest.mock("../../logger.ts", () => ({
  infoMessage: (message: string) => mockInfoMessage(message),
  errorMessage: (message: string) => mockErrorMessage(message),
  warningMessage: (message: string) => {
    if (message === t("session.warning.invalid_env_config")) return;
    mockWarningMessage(message);
  },
}));

const promiseFunction = async (timeout: number): Promise<true> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, timeout);

    jest.advanceTimersByTime(timeout);
  });
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

describe("Given a Session.init function", () => {
  describe("When called", () => {
    const config: SessionConfig = {
      ...mockSessionConfig,
      limit: {
        items: LIMIT_ITEMS_MAX + 1,
      },
    };

    test("Then it should start the store with curated passed configs", () => {
      const { end: cleanUpEnd } = Session(config).init();

      expect(mockInit).toHaveBeenCalledWith(setConfig(config));

      cleanUpEnd();
    });

    test("Then it should send a info message", () => {
      const { end: cleanUpEnd } = Session(config).init();

      expect(mockInfoMessage).toHaveBeenCalledWith(t("session.init"));

      cleanUpEnd();
    });
  });

  describe("When called on an already inited session", () => {
    test("Then it should throw an error", () => {
      const { init, end: cleanUpEnd } = Session();

      init();

      expect(init).toThrow(t("session.error.initialized"));

      cleanUpEnd();
    });
  });

  describe("When listening for a session end event", () => {
    test("Then it should end the session if called with a status of 'false'", () => {
      Session().init();

      EventBus.emit("SESSION:ACTIVE", false);

      expect(mockEnd).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Given a Session.end function", () => {
  describe("When called with no parameters", () => {
    test("Then it should softly end the store", () => {
      Session(mockSessionConfig).init().end();

      expect(mockEnd).toHaveBeenCalledWith(true);
    });
  });

  describe("When called with a parameter of true", () => {
    test("Then it should abruptly end the store", () => {
      Session(mockSessionConfig).init().end(true);

      expect(mockEnd).toHaveBeenCalledWith(false);
    });

    test("Then it should send a info message", () => {
      Session(mockSessionConfig).init().end();

      expect(mockInfoMessage).toHaveBeenCalledWith(t("session.end"));
    });
  });

  describe("When called without the store being initiated", () => {
    test("Then it should do nothing", () => {
      Session(mockSessionConfig).end();

      expect(mockEnd).not.toHaveBeenCalled();
      expect(mockInfoMessage).not.toHaveBeenCalled();
    });
  });
});

describe("Given a Session.error function", () => {
  describe("When called with a critical error", () => {
    test("It should log it, end the session and send an error message", () => {
      const testError = new Error("error");
      const isCritical = true;

      const { error } = Session().init();

      error(testError, isCritical);

      expect(mockEnd).toHaveBeenCalledTimes(1);
      expect(mockErrorMessage).toHaveBeenCalledTimes(1);
      expect(mockLogError).toHaveBeenCalledWith(testError, isCritical);
    });
  });

  describe("When called with a non critical error", () => {
    test("It should log it and send an error message", () => {
      const testError = new Error("error");
      const isCritical = false;

      const { error, end: cleanUpEnd } = Session().init();

      error(testError, isCritical);

      expect(mockEnd).not.toHaveBeenCalled();
      expect(mockErrorMessage).toHaveBeenCalledTimes(1);
      expect(mockLogError).toHaveBeenCalledWith(testError, isCritical);

      cleanUpEnd();
    });
  });

  describe("When called with no error", () => {
    test("It should do nothing", () => {
      const { error, end: cleanUpEnd } = Session().init();

      error(undefined);

      expect(mockEnd).not.toHaveBeenCalled();
      expect(mockErrorMessage).not.toHaveBeenCalled();
      expect(mockLogError).not.toHaveBeenCalled();

      cleanUpEnd();
    });
  });
});

describe("Given a Session.setGlobalTimeout function", () => {
  describe("When called with a promise function with a running time lower than the global timeout", () => {
    test("Then it should complete said function", async () => {
      const promiseTimeout = mockGlobalTimeout - 1;
      const { setGlobalTimeout, end: cleanUpEnd } =
        Session(mockSessionConfig).init();

      const response = await setGlobalTimeout(async (cleanUp) => {
        const result = await promiseFunction(promiseTimeout);
        cleanUp();
        return result;
      });

      expect(response).toBe(true);

      cleanUpEnd();
    });
  });

  describe("When called with a promise function with a running time higher than the global timeout", () => {
    test("Then it should log an error and resolve 'ABRUPT_ENDING'", async () => {
      const promiseTimeout = mockGlobalTimeout + 1;
      const { setGlobalTimeout } = Session(mockSessionConfig).init();

      const response = await setGlobalTimeout(async (cleanUp) => {
        const result = await promiseFunction(promiseTimeout);
        cleanUp();
        return result;
      });

      expect(response).toBe("ABRUPT_ENDING");
      expect(mockLogError).toHaveBeenCalledWith(
        Error(t("session.error.global_timeout")),
        true,
      );
    });

    // test("Then it should not complete the passed function", () => {}); // TODO??? IDK WHAT THIS IS
  });
});

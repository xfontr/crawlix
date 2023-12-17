import { LIMIT_MAX } from "../configs/session";
import t from "../i18n";
import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import SessionConfig from "../types/SessionConfig";
import EventBus from "../utils/EventBus";
import setConfig from "../utils/setConfig";
import Session from "./Session";

const mockInit = jest.fn();
const mockEnd = jest.fn();
const mockLogError = jest.fn();

jest.mock("./SessionStore", () => () => ({
  init: (config: SessionConfig) => mockInit(config),
  end: () => mockEnd(),
  current: () => ({}),
  logError: (...args: unknown[]) => mockLogError(...args),
}));

const mockInfoMessage = jest.fn();
const mockErrorMessage = jest.fn();

jest.mock("../logger.ts", () => ({
  infoMessage: (message: string) => mockInfoMessage(message),
  errorMessage: (message: string) => mockErrorMessage(message),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Given a Session.init function", () => {
  describe("When called", () => {
    const config: SessionConfig = {
      ...mockSessionConfig,
      limit: LIMIT_MAX + 1,
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
  describe("When called", () => {
    test("Then it should end the store", () => {
      Session(mockSessionConfig).init().end();

      expect(mockEnd).toHaveBeenCalled();
    });

    test("Then it should send a info message", () => {
      Session(mockSessionConfig).init().end();

      expect(mockInfoMessage).toHaveBeenCalledWith(t("session.end"));
    });
  });

  describe("When called without the store being initiated", () => {
    test("Then it should only send a warning message", () => {
      Session(mockSessionConfig).end();

      expect(mockInfoMessage).toHaveBeenCalledTimes(1);
      expect(mockInfoMessage).toHaveBeenCalledWith(
        t("session.warning.not_initialized"),
      );
    });
  });
});

describe("Given a session.error function", () => {
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
      const { error } = Session().init();

      error(undefined);

      expect(mockEnd).not.toHaveBeenCalled();
      expect(mockErrorMessage).not.toHaveBeenCalled();
      expect(mockLogError).not.toHaveBeenCalled();
    });
  });
});

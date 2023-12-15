import { LIMIT_MAX } from "../configs/session";
import t from "../i18n";
import mockSessionConfig from "../test-utils/mocks/mockSessionConfig";
import SessionConfig from "../types/SessionConfig";
import setConfig from "../utils/setConfig";
import Session from "./Session";

const mockInit = jest.fn();
const mockEnd = jest.fn();
const mockInfoMessage = jest.fn();

jest.mock("./SessionStore", () => () => ({
  init: (config: SessionConfig) => mockInit(config),
  end: () => mockEnd(),
  current: () => ({}),
}));

jest.mock("../logger.ts", () => ({
  infoMessage: (message: string) => mockInfoMessage(message),
}));

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
});

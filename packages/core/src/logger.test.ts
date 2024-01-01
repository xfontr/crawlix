import { errorMessage, infoMessage, warningMessage } from "./logger";

const mockWarn = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();

jest.mock("pino", () => () => ({
  warn: (message: string) => mockWarn(message),
  info: (message: string) => mockInfo(message),
  error: (message: string) => mockError(message),
}));

const mockEmit = jest.fn();

jest.mock("./utils/EventBus", () => ({
  emit: (...args: unknown[]) => mockEmit(...args),
}));

describe("Given a warningMessage function", () => {
  describe("When called with a 'warning' message", () => {
    test("Then it should call the logger warn with said message", () => {
      const message = "warning";

      warningMessage(message);

      expect(mockWarn).toHaveBeenCalledWith(message);
      expect(mockEmit).toHaveBeenCalledWith("SESSION:LOG", message);
    });
  });
});

describe("Given a infoMessage function", () => {
  describe("When called with a 'info' message", () => {
    test("Then it should call the logger warn with said message", () => {
      const message = "info";

      infoMessage(message);

      expect(mockInfo).toHaveBeenCalledWith(message);
      expect(mockEmit).toHaveBeenCalledWith("SESSION:LOG", message);
    });
  });
});

describe("Given a errorMessage function", () => {
  describe("When called with a 'error' message", () => {
    test("Then it should call the logger error with said message", () => {
      const message = "error";

      errorMessage(message);

      expect(mockError).toHaveBeenCalledWith(message);
      expect(mockEmit).toHaveBeenCalledWith("SESSION:LOG", message);
    });
  });
});

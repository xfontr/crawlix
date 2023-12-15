import Events from "../types/Events";
import ScraperSpeed from "../types/ScraperSpeed";
import action from "./useAction";

const mockEmit = jest.fn();
const mockError = jest.fn();

jest.mock("./EventBus", () => ({
  emit: (eventName: Events, speed: number) => mockEmit(eventName, speed),
  on: () => undefined,
}));

jest.mock("pino", () => () => ({
  error: (message: string) => mockError(message),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given an action function", () => {
  describe("When called its returned function with a callback and a random task length", () => {
    const taskLength = Math.floor(Math.random() * 1_000);
    const speed: ScraperSpeed = 0.9;
    const callback = (): Promise<() => Date> =>
      new Promise((resolve) => resolve(() => new Date()));

    const errorMessage = "error";
    const callbackWithError = () =>
      new Promise((_, reject) => reject(new Error(errorMessage)));

    const { $a } = action(taskLength);

    test("Then it should call the callback after the task length and return its value", async () => {
      const start = new Date().getTime();

      const response = (await $a(async () => await callback(), speed))!;

      expect(response().getTime() - start).toBeGreaterThanOrEqual(
        speed * taskLength,
      );
    });

    test("Then it should also count up the amount of actions", async () => {
      const expectedEvent: Events = "ACTION:COUNT";

      await $a(callback, speed);

      expect(mockEmit).toHaveBeenCalledWith(expectedEvent, speed);
    });

    test("Then it should catch any error and emit an error event", async () => {
      const emitCalls = 2; // First for the count up, second for the error, whichever it is

      await $a(callbackWithError, speed);

      expect(mockEmit).toHaveBeenCalledTimes(emitCalls);
    });
  });
});

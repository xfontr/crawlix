import Events from "../types/Events";
import ScraperSpeed from "../types/ScraperSpeed";
import EventBus from "./EventBus";
import useAction from "./useAction";

const mockEmit = jest.fn();
const mockError = jest.fn();

EventBus.on("SESSION:ERROR", (...args: unknown[]) => {
  mockEmit("SESSION:ERROR", ...args);
});

EventBus.on("ACTION:COUNT", (...args: unknown[]) => {
  mockEmit("ACTION:COUNT", ...args);
});

// const emitCopy = EventBus.emit.bind(EventBus.emit)

// EventBus.emit = mockEmit;

jest.mock("pino", () => () => ({
  error: (message: string) => mockError(message),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Given an useAction function", () => {
  const taskLength = Math.floor(Math.random() * 1_000);
  const speed: ScraperSpeed = 0.9;
  const callback = (): Promise<() => Date> =>
    new Promise((resolve) => resolve(() => new Date()));

  const errorMessage = "error";
  const callbackWithError = () =>
    new Promise((_, reject) => reject(new Error(errorMessage)));

  const { $a, action, $$a, criticalAction } = useAction(taskLength);

  describe("When called its returned functions with a callback and no task length", () => {
    test("Then they should work with a delay of 0", async () => {
      const asyncMaxExpectedDelay = 5;

      const normalStart = new Date().getTime();
      const normalResponse = (await $a(async () => await callback()))!;

      expect(normalResponse().getTime() - normalStart).toBeLessThan(
        asyncMaxExpectedDelay,
      );

      const criticalStart = new Date().getTime();
      const criticalResponse = (await $$a(async () => await callback()))!;

      expect(criticalResponse().getTime() - criticalStart).toBeLessThan(
        asyncMaxExpectedDelay,
      );
    });
  });

  describe("When called its returned function $a with a callback and a random task length", () => {
    test("Then it should call the callback after the task length and return its value", async () => {
      const start = new Date().getTime();

      const response = (await $a(async () => await callback(), speed))!;

      expect(response().getTime() - start).toBeGreaterThanOrEqual(
        speed * taskLength,
      );
    });

    test("Then it should also count up the amount of actions", async () => {
      const numberOfCalls = 1;
      const expectedEvent: Events = "ACTION:COUNT";

      await action(callback, speed);

      expect(mockEmit).toHaveBeenCalledWith(expectedEvent, speed);
      expect(mockEmit).toHaveBeenCalledTimes(numberOfCalls);
    });

    test("Then it should catch any error and emit a non-critical error event", async () => {
      const emitCalls = 2;

      await $a(callbackWithError, speed);

      expect(mockEmit).toHaveBeenCalledTimes(emitCalls);
      expect(
        (mockEmit.mock.calls[1] as Parameters<typeof EventBus.emit>)[2],
      ).toBe(false);
    });

    test("Then it should not do anything if the session is off", async () => {
      EventBus.emit("SESSION:ACTIVE", false);

      await action(callback, speed);

      expect(mockEmit).not.toHaveBeenCalled();

      // Clean up
      EventBus.emit("SESSION:ACTIVE", true);
    });
  });

  describe("When called its returned function $$a with a callback and a random task length", () => {
    test("Then it should behave as the $a function", async () => {
      const numberOfCalls = 1;
      const start = new Date().getTime();
      const expectedEvent: Events = "ACTION:COUNT";

      const response = (await $$a(async () => await callback(), speed))!;

      expect(response().getTime() - start).toBeGreaterThanOrEqual(
        speed * taskLength,
      );
      expect(mockEmit).toHaveBeenCalledWith(expectedEvent, speed);
      expect(mockEmit).toHaveBeenCalledTimes(numberOfCalls);
    });

    test("Then it should catch any error and emit a critical error event", async () => {
      const emitCalls = 2;

      await criticalAction(callbackWithError, speed);

      expect(mockEmit).toHaveBeenCalledTimes(emitCalls);
      expect(
        (mockEmit.mock.calls[1] as Parameters<typeof EventBus.emit>)[2],
      ).toBe(true);
    });
  });
});

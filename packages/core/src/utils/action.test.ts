import Events from "../types/Events";
import ScraperSpeed from "../types/ScraperSpeed";
import action from "./action";

const mockEmit = jest.fn();

jest.mock("./EventBus", () => ({
  emit: (eventName: Events, speed: number) => mockEmit(eventName, speed),
}));

describe("Given an action function", () => {
  describe("When called its returned function with a callback and a random task length", () => {
    const taskLength = Math.floor(Math.random() * 1_000);
    const speed: ScraperSpeed = 0.9;
    const callback = (): Promise<() => Date> =>
      new Promise((resolve) => resolve(() => new Date()));

    test("Then it should call the callback after the task length and return its value", async () => {
      const $a = action(taskLength);

      const start = new Date().getTime();

      const response = (await $a(async () => await callback(), speed))!;

      expect(response().getTime() - start).toBeGreaterThanOrEqual(
        speed * taskLength,
      );
    });

    test("Then it should also count up the amount of actions", async () => {
      const expectedEvent: Events = "COUNT_ACTION";
      const $a = action(taskLength);

      await $a(callback, speed);

      expect(mockEmit).toHaveBeenCalledWith(expectedEvent, speed);
    });
  });
});

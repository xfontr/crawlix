import { delay, promiseLoop, runAfterAllInSeq } from "../promises";

const DELAY_TIME = 100;

describe("Given a function promiseLoop", () => {
  describe("When the condition is to reach 4 iterations", () => {
    test("Then it should call the callback 4 times", async () => {
      const iterations = 3;
      const callback = jest.fn();

      await promiseLoop(callback, (index) => index > iterations);

      expect(callback).toHaveBeenCalledTimes(4);
      expect(callback).toHaveBeenNthCalledWith(1, 0);
      expect(callback).toHaveBeenNthCalledWith(2, 1);
      expect(callback).toHaveBeenNthCalledWith(3, 2);
      expect(callback).toHaveBeenNthCalledWith(4, 3);
    });
  });

  describe("When the loop size is exceeded", () => {
    test("Then it should throw an error", async () => {
      const iterations = 5;
      const callback = jest.fn();

      await expect(
        promiseLoop(callback, () => false, iterations),
      ).rejects.toThrow(`Loop size has been exceeded at index '${iterations}'`);
    });
  });
});

describe("Given a function runAfterAllInSeq", () => {
  describe("When called with an output of 'output' and 3 callbacks", () => {
    test("Then it should run each callback sequentially, passing said output", async () => {
      const output = "output";
      const callbacks = [jest.fn(), jest.fn(), jest.fn()];

      await runAfterAllInSeq(output, ...callbacks);

      expect(callbacks[0]).toHaveBeenCalledWith(output);
      expect(callbacks[1]).toHaveBeenCalledWith(output);
      expect(callbacks[2]).toHaveBeenCalledWith(output);
    });
  });

  describe("When called with no callbacks", () => {
    test("Then it should do nothing", async () => {
      const output = "output";

      const result = await runAfterAllInSeq(output);

      expect(result).toBeUndefined();
    });
  });
});

describe("Given a function 'delay'", () => {
  describe("When called with no delay", () => {
    test("Then it should return the result of the callback immediately", async () => {
      const callback = jest.fn().mockResolvedValue("result");

      const start = Date.now();
      const result = (await delay(callback)) as string;

      expect(result).toBe("result");
      expect(callback).toHaveBeenCalledTimes(1);
      expect(Date.now() - start).toBeLessThanOrEqual(5);
    });
  });

  describe("When called with delay", () => {
    test("Then it should wait for the specified delay before calling the callback", async () => {
      const callback = jest.fn().mockResolvedValue("result");

      const start = Date.now();
      const result = (await delay(callback, DELAY_TIME)) as string;

      expect(result).toBe("result");
      expect(callback).toHaveBeenCalledTimes(1);
      expect(Date.now() - start).toBeGreaterThanOrEqual(DELAY_TIME);
    });
  });
});
